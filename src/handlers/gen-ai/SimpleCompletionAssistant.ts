import { Logger } from '@nestjs/common';
import { Agent } from 'https';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';

export default class SimpleCompletionAssistant {
    private readonly logger: Logger = new Logger('SimpleCompletionAssistant');
    private readonly setupMessage: string;
    private readonly model: string;
    private readonly openaiClient: OpenAI;

    constructor(setupMessage: string, model = 'deepseek-chat') {
        this.setupMessage = setupMessage;
        this.model = model;
        this.openaiClient = model.includes('deepseek')
            ? new OpenAI({
                  baseURL: process.env.DEEPSEEK_BASE_URL,
                  apiKey: process.env.DEEPSEEK_API_KEY,
                  httpAgent: new Agent({ rejectUnauthorized: false }),
              })
            : new OpenAI({
                  apiKey: process.env.OPENAI_API_KEY,
              });
        this.logger.log(
            `Initialized SimpleCompletionAssistant with model: ${model}`,
        );
    }

    async createCompletion(message: string): Promise<string> {
        this.logger.log('Creating OpenAI client instance');

        const processedMessages: Array<ChatCompletionMessageParam> = [
            { role: 'system', content: this.setupMessage },
            { role: 'user', content: message },
        ];

        this.logger.debug(
            `Processed messages: ${JSON.stringify(processedMessages)}`,
        );
        this.logger.log(`Requesting completion with model: ${this.model}`);

        try {
            const completion = await this.openaiClient.chat.completions.create({
                messages: processedMessages,
                model: this.model,
            });

            const responseContent = completion.choices[0].message.content;
            this.logger.log('Received completion');
            this.logger.debug(`Completion response: ${responseContent}`);

            return responseContent;
        } catch (error) {
            this.logger.error(
                'Error during chat completion',
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }
    }
}
