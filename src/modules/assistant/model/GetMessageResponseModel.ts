import { MessageRole } from 'src/types/gen-ai';

export default class GetMessageResponseModel {
    constructor(
        public id: string,
        public content: string,
        public createdAt: Date,
        public role: MessageRole,
        public chatId: string,
    ) {}
}
