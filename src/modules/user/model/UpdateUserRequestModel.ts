export default class UpdateUserRequestModel {
    constructor(
        public id: string,
        public email: string,
        public fullname: string,
        public birthdate: string,
    ) {}
}
