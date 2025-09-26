export default class HandleIncomingMessageRequestPayload {
    userId: string;
    content: string;

    constructor(userId: string, content: string) {
        this.userId = userId;
        this.content = content;
    }
}
