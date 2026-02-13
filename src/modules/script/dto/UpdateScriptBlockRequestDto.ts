import { ApiPropertyOptional } from '@nestjs/swagger';
import { SCRIPT_BLOCK_TYPES } from 'src/constants';
import { ScriptBlockType } from 'src/types/script';

export default class UpdateScriptBlockRequestDto {
    @ApiPropertyOptional({ enum: SCRIPT_BLOCK_TYPES })
    public type?: ScriptBlockType;

    @ApiPropertyOptional()
    public content?: string;

    @ApiPropertyOptional()
    public objective?: string;

    @ApiPropertyOptional()
    public expectedResponse?: string;

    @ApiPropertyOptional()
    public commonMistakes?: string;
}
