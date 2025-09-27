import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetScriptResponseDto from './GetScriptResponseDto';

export default class ListScriptsResponseDto
    implements ListResponse<GetScriptResponseDto>
{
    @ApiProperty({ type: [GetScriptResponseDto] })
    items: GetScriptResponseDto[];
}
