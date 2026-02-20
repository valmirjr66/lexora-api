import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class InsertOccurrenceRequestDto {
    @ApiProperty({ required: true })
    public applicantName: string;

    @ApiPropertyOptional()
    public transcriptRaw?: string;
}
