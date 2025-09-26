import { ApiProperty } from '@nestjs/swagger';

export default class InsertUserRequestDto {
    @ApiProperty({ required: true })
    public fullname: string;

    @ApiProperty({ required: true })
    public email: string;

    @ApiProperty({ required: true })
    public password: string;

    @ApiProperty({ required: true })
    public birthdate: string;
}
