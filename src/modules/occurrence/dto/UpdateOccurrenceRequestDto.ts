import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OCCURRENCE_STATUSES } from 'src/constants';
import { OccurrenceStatus } from 'src/types/occurrence';

export default class UpdateOccurrenceRequestDto {
    @ApiProperty({ required: true })
    public subjectName: string;

    @ApiProperty({ required: true, enum: OCCURRENCE_STATUSES })
    public status: OccurrenceStatus;

    @ApiPropertyOptional({ nullable: true })
    public transcriptRaw?: string;

    @ApiPropertyOptional({ nullable: true })
    public outputId?: string;

    @ApiPropertyOptional({ nullable: true })
    public finishedAt?: Date;
}
