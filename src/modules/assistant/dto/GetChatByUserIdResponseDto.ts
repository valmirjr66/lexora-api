import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetMessageResponseDto from './GetMessageResponseDto';

export default class GetChatByUserIdResponseDto
    implements ListResponse<GetMessageResponseDto>
{
    @ApiProperty({ type: [GetMessageResponseDto] })
    items: GetMessageResponseDto[];
}
