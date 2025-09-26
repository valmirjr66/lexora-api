import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import ChatAssistant, { TextResponse } from 'src/handlers/gen-ai/ChatAssistant';
import UserInfoTool from 'src/handlers/gen-ai/UserInfoTool';
import GetChatByUserIdResponseModel from 'src/modules/assistant/model/GetChatByUserIdResponseModel';
import GetMessageResponseModel from './model/GetMessageResponseModel';
import HandleIncomingMessageRequestModel from './model/HandleIncomingMessageRequestModel';
import HandleIncomingMessageResponseModel from './model/HandleIncomingMessageResponseModel';
import { LexoraChat } from './schemas/LexoraChatSchema';
import { Message } from './schemas/MessageSchema';

@Injectable()
export default class LexoraService {
    private readonly logger: Logger = new Logger('LexoraService');
    private readonly chatAssistant: ChatAssistant;

    constructor(
        private readonly userInfoTool: UserInfoTool,
        @InjectModel(Message.name)
        private readonly messageModel: Model<Message>,
        @InjectModel(LexoraChat.name)
        private readonly lexoraChatModel: Model<LexoraChat>,
    ) {
        this.chatAssistant = new ChatAssistant(this.userInfoTool);
    }

    async getChatByUserId(
        userId: string,
    ): Promise<GetChatByUserIdResponseModel> {
        this.logger.debug(`getChatByUserId called with userId: ${userId}`);
        const chat = await this.findUserChatAndCreateIfNotExists(userId);

        const chatMessages = await this.messageModel.find({
            chatId: chat._id,
        });

        if (chatMessages.length === 0) {
            this.logger.warn(`No messages found for user: ${userId}`);
        } else {
            this.logger.log(
                `Found ${chatMessages.length} messages for user: ${userId}`,
            );
        }

        const response = new GetChatByUserIdResponseModel(
            chatMessages.map((item) => {
                const pojoItem = item.toObject();
                return new GetMessageResponseModel(
                    pojoItem._id.toString(),
                    pojoItem.content,
                    pojoItem.createdAt,
                    pojoItem.role,
                    chat._id.toString(),
                );
            }),
        );

        this.logger.debug(
            `Returning conversation response for user: ${userId}`,
        );
        return response;
    }

    async handleIncomingMessage(
        model: HandleIncomingMessageRequestModel,
        streamingCallback?: (
            userId: string,
            textSnapshot: string,
            finished?: boolean,
        ) => void,
    ): Promise<HandleIncomingMessageResponseModel> {
        this.logger.debug(
            `handleIncomingMessage called for user: ${model.userId} with content: ${model.content}`,
        );

        const chat = await this.findUserChatAndCreateIfNotExists(model.userId);

        const threadId = chat.threadId;
        const chatId = chat._id;

        this.logger.debug(`Adding user message to chatId: ${chatId}`);
        await this.messageModel.create({
            _id: new mongoose.Types.ObjectId(),
            content: model.content,
            role: 'user',
            chatId: chatId,
        });

        let messageAddedToThread: TextResponse;
        if (streamingCallback) {
            this.logger.debug(
                `Using streamingCallback for user: ${model.userId}`,
            );
            messageAddedToThread =
                await this.chatAssistant.addMessageToThreadByStream(
                    threadId,
                    model.content,
                    model.userId,
                    (textSnapshot: string) => {
                        this.logger.debug(
                            `Streaming snapshot for user: ${model.userId}`,
                        );
                        streamingCallback(model.userId, textSnapshot);
                    },
                );
        } else {
            this.logger.debug(
                `Using non-streaming message for user: ${model.userId}`,
            );
            messageAddedToThread = await this.chatAssistant.addMessageToThread(
                threadId,
                model.content,
                model.userId,
            );
        }

        this.logger.debug(
            `Prettifying assistant response for user: ${model.userId}`,
        );

        if (streamingCallback) {
            this.logger.debug(
                `Sending final streaming callback for user: ${model.userId}`,
            );
            streamingCallback(model.userId, messageAddedToThread.content, true);
        }

        this.logger.debug(`Updating chat updatedAt for chatId: ${chatId}`);
        await this.lexoraChatModel.updateOne(
            { _id: chatId },
            { updatedAt: new Date() },
        );

        this.logger.debug(`Saving assistant message to chatId: ${chatId}`);
        const response = await this.messageModel
            .create({
                _id: new mongoose.Types.ObjectId(),
                content: messageAddedToThread.content,
                role: 'assistant',
                chatId: chatId,
            })
            .then((doc) => doc.toObject());

        this.logger.log(
            `Assistant message sent for user: ${model.userId} with messageId: ${response._id}`,
        );

        return new HandleIncomingMessageResponseModel(
            response._id.toString(),
            response.content,
            response.role,
        );
    }

    private async findUserChatAndCreateIfNotExists(
        userId: string,
    ): Promise<LexoraChat> {
        let chat = (
            await this.lexoraChatModel.findOne({ userId }).exec()
        )?.toObject();

        if (!chat) {
            this.logger.log(
                `No chat found for user: ${userId}. Creating new chat.`,
            );
            const threadId = await this.chatAssistant.startThread();
            this.logger.debug(`Started new thread with threadId: ${threadId}`);

            chat = await this.lexoraChatModel.create({
                _id: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                userId,
                threadId,
            });
            this.logger.log(
                `Created new chat for user: ${userId} with chatId: ${chat._id}`,
            );
        } else {
            this.logger.log(
                `Found existing chat for user: ${userId} with chatId: ${chat._id}`,
            );
        }

        return chat;
    }
}
