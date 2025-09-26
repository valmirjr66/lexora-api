import { ApiProperty } from '@nestjs/swagger';

export default class ChangeProfilePictureRequestDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    profilePicture: Express.Multer.File;
}
