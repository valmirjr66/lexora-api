import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { SCRIPT_BLOCK_TYPES } from 'src/constants';
import { ScriptBlockType } from 'src/types/script';

export default class InsertScriptBlockRequestDto {
    @ApiProperty({ required: true, enum: SCRIPT_BLOCK_TYPES })
    public type: ScriptBlockType;

    @ApiProperty({ required: true, minimum: 1 })
    @IsInt()
    @Min(1)
    public order: number;

    @ApiProperty({ required: true })
    public content: string;

    @ApiPropertyOptional()
    public objective?: string;

    @ApiPropertyOptional()
    public expectedResponse?: string;

    @ApiPropertyOptional()
    public commonMistakes?: string;
}
