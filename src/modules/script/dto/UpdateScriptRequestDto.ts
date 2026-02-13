import { ApiPropertyOptional } from '@nestjs/swagger';
import { SCRIPT_TYPES } from 'src/constants';
import { ScriptType } from 'src/types/script';

export default class UpdateScriptRequestDto {
    @ApiPropertyOptional()
    public title?: string;

    @ApiPropertyOptional({ enum: SCRIPT_TYPES })
    public type?: ScriptType;

    @ApiPropertyOptional()
    public description?: string;
}
