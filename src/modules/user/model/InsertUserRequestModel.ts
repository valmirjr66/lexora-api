export default class InsertUserRequestModel {
    constructor(
        public fullname: string,
        public email: string,
        public password: string,
        public birthdate: string,
    ) {}
}
