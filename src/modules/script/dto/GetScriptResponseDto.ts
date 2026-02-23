import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SCRIPT_BLOCK_TYPES, SCRIPT_TYPES } from 'src/constants';
import { ScriptBlockType, ScriptType } from 'src/types/script';

export class GetScriptBlockResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public scriptId: string;

    @ApiProperty({ enum: SCRIPT_BLOCK_TYPES })
    public type: ScriptBlockType;

    @ApiProperty()
    public content: string;

    @ApiPropertyOptional()
    public objective?: string;

    @ApiPropertyOptional()
    public expectedResponse?: string;

    @ApiPropertyOptional()
    public commonMistakes?: string;

    @ApiProperty()
    public createdAt: Date;

    @ApiProperty()
    public updatedAt: Date;
}

export default class GetScriptResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public owner: string;

    @ApiProperty()
    public title: string;

    @ApiProperty({ enum: SCRIPT_TYPES })
    public type: ScriptType;

    @ApiPropertyOptional()
    public description?: string;

    @ApiProperty({ type: [GetScriptBlockResponseDto] })
    public blocks: GetScriptBlockResponseDto[];

    @ApiProperty()
    public createdAt: Date;

    @ApiProperty()
    public updatedAt: Date;
}
