import { ApiProperty } from '@nestjs/swagger';

export default class AttachTranscriptRequestDto {
    @ApiProperty({ required: true })
    public transcriptRaw: string;
}
