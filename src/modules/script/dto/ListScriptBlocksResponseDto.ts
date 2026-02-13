import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import { GetScriptBlockResponseDto } from './GetScriptResponseDto';

export default class ListScriptBlocksResponseDto
    implements ListResponse<GetScriptBlockResponseDto>
{
    @ApiProperty({ type: [GetScriptBlockResponseDto] })
    items: GetScriptBlockResponseDto[];
}
