import { ApiProperty } from '@nestjs/swagger';

export default class InsertOccurrenceRequestDto {
    @ApiProperty({ required: true })
    public applicantName: string;
}
