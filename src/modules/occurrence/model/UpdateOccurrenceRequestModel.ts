import { OccurrenceStatus } from 'src/types/occurrence';

export default class UpdateOccurrenceRequestModel {
    public id: string;
    public applicantName: string;
    public status: OccurrenceStatus;
    public transcriptRaw?: string;
    public outputId?: string;
    public finishedAt?: Date;
}
