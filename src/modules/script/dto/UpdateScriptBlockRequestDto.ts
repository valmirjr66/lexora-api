import { ApiProperty } from '@nestjs/swagger';
import { ScriptBlockType } from 'src/types/script';

export default class UpdateScriptBlockRequestDto {
    @ApiProperty({ required: true })
    public type: ScriptBlockType;

    @ApiProperty({ required: true })
    public content: string;
}
