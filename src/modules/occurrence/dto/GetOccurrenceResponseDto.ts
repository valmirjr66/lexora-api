import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OCCURRENCE_STATUSES } from 'src/constants';
import { OccurrenceStatus } from 'src/types/occurrence';

export default class GetOccurrenceResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public scriptId: string;

    @ApiProperty()
    public scriptVersion: number;

    @ApiProperty()
    public applicantName: string;

    @ApiProperty({ enum: OCCURRENCE_STATUSES })
    public status: OccurrenceStatus;

    @ApiPropertyOptional()
    public transcriptRaw?: string;

    @ApiPropertyOptional()
    public outputId?: string;

    @ApiProperty()
    public createdAt: Date;

    @ApiProperty()
    public startedAt: Date;

    @ApiPropertyOptional()
    public finishedAt?: Date;
}
