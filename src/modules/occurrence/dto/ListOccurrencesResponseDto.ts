import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetOccurrenceResponseDto from './GetOccurrenceResponseDto';

export default class ListOccurrencesResponseDto
    implements ListResponse<GetOccurrenceResponseDto>
{
    @ApiProperty({ type: [GetOccurrenceResponseDto] })
    items: GetOccurrenceResponseDto[];
}
