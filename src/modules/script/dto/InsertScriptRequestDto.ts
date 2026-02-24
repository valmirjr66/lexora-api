import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SCRIPT_TYPE, SCRIPT_TYPES } from 'src/constants';
import { ScriptType } from 'src/types/script';

export default class InsertScriptRequestDto {
    @ApiProperty({ required: true })
    public userId: string;

    @ApiProperty({ required: true })
    public title: string;

    @ApiProperty({
        required: true,
        enum: SCRIPT_TYPES,
        default: SCRIPT_TYPE.TECHNICAL_INTERVIEW,
    })
    public type: ScriptType;

    @ApiPropertyOptional()
    public description?: string;
}
