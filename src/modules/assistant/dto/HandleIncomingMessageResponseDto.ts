import { ApiProperty } from '@nestjs/swagger';
import { MESSAGE_ROLES } from 'src/constants';
import { MessageRole } from 'src/types/gen-ai';

export default class HandleIncomingMessageResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public content: string;

    @ApiProperty({ enum: MESSAGE_ROLES })
    public role: MessageRole;
}
