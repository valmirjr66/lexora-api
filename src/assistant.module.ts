import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import LexoraController from './modules/assistant/LexoraController';
import {
    LexoraChat,
    LexoraChatSchema,
} from './modules/assistant/schemas/LexoraChatSchema';
import {
    Message,
    MessageSchema,
} from './modules/assistant/schemas/MessageSchema';

import ChatAssistant from './handlers/gen-ai/ChatAssistant';
import UserInfoTool from './handlers/gen-ai/UserInfoTool';
import LexoraGateway from './modules/assistant/LexoraGateway';
import LexoraService from './modules/assistant/LexoraService';
import { UserModule } from './user.module';

@Module({
    controllers: [LexoraController],
    providers: [LexoraGateway, LexoraService, ChatAssistant, UserInfoTool],
    imports: [
        UserModule,
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: LexoraChat.name, schema: LexoraChatSchema },
            { name: LexoraChat.name, schema: LexoraChatSchema },
        ]),
    ],
    exports: [LexoraService, MongooseModule],
})
export class AssistantModule {}
