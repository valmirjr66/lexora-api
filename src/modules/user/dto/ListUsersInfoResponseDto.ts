import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetUserInfoResponseDto from './GetUserInfoResponseDto';

export default class ListUsersInfoResponseDto
    implements ListResponse<GetUserInfoResponseDto>
{
    @ApiProperty({ type: [GetUserInfoResponseDto] })
    items: GetUserInfoResponseDto[];
}
