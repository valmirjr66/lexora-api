export default class AuthenticateUserRequestModel {
    constructor(
        public email: string,
        public password: string,
    ) {}
}
