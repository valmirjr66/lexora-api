import { ApiProperty } from '@nestjs/swagger';

export default class HandleIncomingMessageRequestDto {
    @ApiProperty({ required: true })
    public userId: string;

    @ApiProperty({ required: true })
    public content: string;
}
