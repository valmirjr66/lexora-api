import { ApiProperty } from '@nestjs/swagger';

export default class UpdateUserRequestDto {
    @ApiProperty({ required: true })
    public email: string;

    @ApiProperty({ required: true })
    public fullname: string;

    @ApiProperty({ required: true })
    public birthdate: string;
}
