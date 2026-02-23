import { OccurrenceStatus } from 'src/types/occurrence';

export default class GetOccurrenceResponseModel {
    constructor(
        public id: string,
        public scriptId: string,
        public applicantName: string,
        public status: OccurrenceStatus,
        public transcriptRaw: string | undefined,
        public outputId: string | undefined,
        public createdAt: Date,
        public finishedAt: Date | undefined,
    ) {}
}
