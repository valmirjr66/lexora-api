import { OCCURRENCE_STATUS } from 'src/constants';

export type OccurrenceStatus =
    (typeof OCCURRENCE_STATUS)[keyof typeof OCCURRENCE_STATUS];
