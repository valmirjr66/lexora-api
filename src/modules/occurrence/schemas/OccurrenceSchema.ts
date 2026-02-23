import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OCCURRENCE_STATUS } from 'src/constants';
import { OccurrenceStatus } from 'src/types/occurrence';
import BaseSchema from '../../../BaseSchema';

export type OccurrenceDocument = HydratedDocument<Occurrence>;

@Schema({ timestamps: true })
export class Occurrence extends BaseSchema {
    @Prop({ required: true })
    scriptId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    applicantName: string;

    @Prop({ required: true, default: OCCURRENCE_STATUS.CREATED })
    status: OccurrenceStatus;

    @Prop()
    transcriptRaw?: string;

    @Prop()
    outputId?: mongoose.Types.ObjectId;
}

export const OccurrenceSchema = SchemaFactory.createForClass(Occurrence);
