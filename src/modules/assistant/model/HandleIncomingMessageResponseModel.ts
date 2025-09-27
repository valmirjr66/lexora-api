import { MessageRole } from 'src/types/gen-ai';

export default class HandleIncomingMessageResponseModel {
    constructor(
        public id: string,
        public content: string,
        public role: MessageRole,
    ) {}
}
