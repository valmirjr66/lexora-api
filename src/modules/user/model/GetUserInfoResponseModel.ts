export default class GetUserInfoResponseModel {
    constructor(
        public id: string,
        public fullname: string,
        public email: string,
        public birthdate: string,
        public profilePicFileName?: string,
    ) {}
}
