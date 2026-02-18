import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SCRIPT_TYPES } from 'src/constants';
import { ScriptType } from 'src/types/script';

export default class UpdateScriptRequestDto {
    @ApiProperty({ required: true })
    public title: string;

    @ApiProperty({ required: true, enum: SCRIPT_TYPES })
    public type: ScriptType;

    @ApiPropertyOptional({ nullable: true })
    public description?: string;
}
