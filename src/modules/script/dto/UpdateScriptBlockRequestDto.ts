import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SCRIPT_BLOCK_TYPES } from 'src/constants';
import { ScriptBlockType } from 'src/types/script';

export default class UpdateScriptBlockRequestDto {
    @ApiProperty({ required: true, enum: SCRIPT_BLOCK_TYPES })
    public type: ScriptBlockType;

    @ApiProperty({ required: true })
    public content: string;

    @ApiPropertyOptional({ nullable: true })
    public objective?: string;

    @ApiPropertyOptional({ nullable: true })
    public expectedResponse?: string;

    @ApiPropertyOptional({ nullable: true })
    public commonMistakes?: string;
}
