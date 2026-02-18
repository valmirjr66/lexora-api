import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class InsertOccurrenceRequestDto {
    @ApiProperty({ required: true })
    public subjectName: string;

    @ApiPropertyOptional()
    public transcriptRaw?: string;
}
