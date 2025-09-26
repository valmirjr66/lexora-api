import { ApiProperty } from '@nestjs/swagger';
import { MESSAGE_ROLES } from 'src/constants';
import { MessageRole } from 'src/types/gen-ai';

export default class GetMessageResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty({ enum: MESSAGE_ROLES })
    role: MessageRole;

    @ApiProperty()
    chatId: string;
}
