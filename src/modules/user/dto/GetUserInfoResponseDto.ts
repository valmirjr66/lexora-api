import { ApiProperty } from '@nestjs/swagger';

export default class GetDoctorUserInfoResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public email: string;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public profilePicFileName?: string;
}
