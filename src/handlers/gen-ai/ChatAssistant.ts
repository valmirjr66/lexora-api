import { Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { TextContentBlock } from 'openai/resources/beta/threads/messages.mjs';
import { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs.mjs';
import { RequiredActionFunctionToolCall } from 'openai/src/resources/beta/threads/runs/runs.js';
import UserInfoTool from './UserInfoTool';

export class TextResponse {
    constructor(content: string) {
        this.content = content;
    }

    content: string;
}

export default class ChatAssistant {
    private readonly logger: Logger = new Logger('ChatAssistant');
    private readonly openaiClient: OpenAI = new OpenAI();
    private readonly assistantId: string = process.env.LEXORA_ID;

    constructor(private readonly userInfoTool: UserInfoTool) {}

    public async startThread(): Promise<string> {
        this.logger.log('Starting new thread...');
        const thread = await this.openaiClient.beta.threads.create();
        this.logger.log(`Thread started with id: ${thread.id}`);
        return thread.id;
    }

    public async addMessageToThread(
        threadId: string,
        message: string,
        userId: string,
    ): Promise<TextResponse> {
        this.logger.log(`Adding message to thread ${threadId}: "${message}"`);
        await this.openaiClient.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        let run = await this.openaiClient.beta.threads.runs.createAndPoll(
            threadId,
            {
                assistant_id: this.assistantId,
            },
        );

        const context: Record<string, any> = {};

        while (
            run.status === 'requires_action' &&
            run.required_action?.type === 'submit_tool_outputs'
        ) {
            this.logger.log(
                `Run requires action: submit_tool_outputs on thread ${threadId}`,
            );
            const toolCalls =
                run.required_action.submit_tool_outputs.tool_calls;

            const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = [];

            for (const call of toolCalls) {
                this.logger.log(
                    `Executing tool call: ${call.function.name} (id: ${call.id})`,
                );
                await this.executeToolCall(call, context, toolOutputs, userId);
            }

            this.logger.log(
                `Submitting tool outputs for thread ${threadId}: ${JSON.stringify(toolOutputs)}`,
            );
            run =
                await this.openaiClient.beta.threads.runs.submitToolOutputsAndPoll(
                    threadId,
                    run.id,
                    { tool_outputs: toolOutputs },
                );
        }

        if (run.status === 'completed') {
            this.logger.log(`Run completed for thread ${threadId}`);
            const messages = await this.openaiClient.beta.threads.messages.list(
                run.thread_id,
            );

            const responseContent = messages.data[0].content;

            // TODO: Remove this validation as it's only a temporary workaround
            // so I don't have to deal with all response types right now
            if (
                responseContent.length > 1 ||
                responseContent[0].type !== 'text'
            ) {
                this.logger.error(
                    `Unknown response format for thread ${threadId}: ${JSON.stringify(responseContent)}`,
                );
                throw new Error('Unknown response format');
            }

            this.logger.log(
                `Returning response for thread ${threadId}: "${responseContent[0].text.value}"`,
            );
            return new TextResponse(responseContent[0].text.value);
        } else {
            this.logger.error(
                `Run status was: '${run.status}' on thread ${threadId}. Error: ${JSON.stringify(run.last_error)}`,
            );

            throw new Error("Run wasn't completed");
        }
    }

    public async addMessageToThreadByStream(
        threadId: string,
        message: string,
        userId: string,
        streamingCallback: (textSnapshot: string, finished: boolean) => void,
    ): Promise<TextResponse> {
        this.logger.log(
            `Adding message to thread ${threadId} (stream): "${message}"`,
        );
        await this.openaiClient.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        let response: TextResponse | undefined;

        const runStream = this.openaiClient.beta.threads.runs
            .stream(threadId, {
                assistant_id: this.assistantId,
            })
            .on('textCreated', () =>
                this.logger.log(
                    `TextCreated for thread '${threadId}' with incoming message '${message}'`,
                ),
            )
            .on('textDelta', (_textDelta, snapshot) => {
                this.logger.log(
                    `Received text delta for thread ${threadId}: "${snapshot.value}"`,
                );
                streamingCallback(snapshot.value, false);
            })
            .on('messageDone', async (message) => {
                const textContent = message.content[0] as TextContentBlock;
                this.logger.log(
                    `Message done for thread ${threadId}: "${textContent.text.value}"`,
                );
                streamingCallback(textContent.text.value, true);

                response = new TextResponse(textContent.text.value);
            });

        await runStream.done();

        let run = await runStream.finalRun();

        const context: Record<string, any> = {};

        while (
            run.status === 'requires_action' &&
            run.required_action?.type === 'submit_tool_outputs'
        ) {
            this.logger.log(
                `Run requires action: submit_tool_outputs on thread ${threadId} (stream)`,
            );
            const toolCalls =
                run.required_action.submit_tool_outputs.tool_calls;

            const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = [];

            for (const call of toolCalls) {
                this.logger.log(
                    `Executing tool call: ${call.function.name} (id: ${call.id})`,
                );
                await this.executeToolCall(call, context, toolOutputs, userId);
            }

            this.logger.log(
                `Submitting tool outputs for thread ${threadId} (stream): ${JSON.stringify(toolOutputs)}`,
            );
            run =
                await this.openaiClient.beta.threads.runs.submitToolOutputsAndPoll(
                    threadId,
                    run.id,
                    { tool_outputs: toolOutputs },
                );
        }

        if (!response) {
            this.logger.warn(
                `No response from stream for thread ${threadId}, fetching final messages...`,
            );
            const finalMessages =
                await this.openaiClient.beta.threads.messages.list(threadId);

            const finalContent = finalMessages.data[0]?.content;

            if (
                !finalContent ||
                finalContent.length !== 1 ||
                finalContent[0].type !== 'text'
            ) {
                this.logger.error(
                    `No valid response after tool calls for thread ${threadId}: ${JSON.stringify(finalContent)}`,
                );
                throw new Error('No valid response after tool calls');
            }

            this.logger.log(
                `Returning final response for thread ${threadId}: "${finalContent[0].text.value}"`,
            );
            response = new TextResponse(finalContent[0].text.value);

            streamingCallback(finalContent[0].text.value, true);
        }

        return response;
    }

    private async executeToolCall(
        toolCall: RequiredActionFunctionToolCall,
        context: Record<string, any>,
        toolOutputs: RunSubmitToolOutputsParams.ToolOutput[],
        userId: string,
    ) {
        this.logger.log(
            `Executing tool call function: ${toolCall.function.name} (id: ${toolCall.id}) with args: ${toolCall.function.arguments}`,
        );

        if (toolCall.function.name === 'get_user_info') {
            const userInfo = await this.userInfoTool.getUserInfo(userId);

            context.userInfo = userInfo;

            this.logger.log(
                `get_user_info result: ${JSON.stringify(userInfo)}`,
            );
            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(userInfo),
            });
        } else {
            this.logger.error(`Unknown function: ${toolCall.function.name}`);
            throw new Error(`Unknown function: ${toolCall.function.name}`);
        }
    }
}
