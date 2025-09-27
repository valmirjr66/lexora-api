import { ApiProperty } from '@nestjs/swagger';
import { SCRIPT_BLOCK_TYPES } from 'src/constants';
import { ScriptBlockType } from 'src/types/script';

export class GetScriptBlockResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty({ enum: SCRIPT_BLOCK_TYPES })
    public type: ScriptBlockType;

    @ApiProperty()
    public content: string;
}

export default class GetScriptResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public userId: string;

    @ApiProperty()
    public title: string;

    @ApiProperty()
    public blocks: GetScriptBlockResponseDto[];

    @ApiProperty()
    public createdAt: Date;

    @ApiProperty()
    public updatedAt: Date;
}
