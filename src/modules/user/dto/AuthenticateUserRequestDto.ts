import { ApiProperty } from '@nestjs/swagger';

export default class AuthenticateUserRequestDto {
    @ApiProperty({ required: true })
    public email: string;

    @ApiProperty({ required: true })
    public password: string;
}
