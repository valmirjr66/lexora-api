import { ApiProperty } from '@nestjs/swagger';

export default class UpdateScriptRequestDto {
    @ApiProperty({ required: true })
    public id: string;

    @ApiProperty({ required: true })
    public title: string;

    @ApiProperty({ required: true })
    public description: string;
}
