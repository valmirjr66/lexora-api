import { ApiProperty } from '@nestjs/swagger';

export default class InsertScriptRequestDto {
    @ApiProperty({ required: true })
    public userId: string;

    @ApiProperty({ required: true })
    public title: string;
}
