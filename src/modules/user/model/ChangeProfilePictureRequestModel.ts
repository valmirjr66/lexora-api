export default class ChangeProfilePictureRequestModel {
    constructor(
        public readonly userId: string,
        public readonly profilePicture: Express.Multer.File,
    ) {}
}
