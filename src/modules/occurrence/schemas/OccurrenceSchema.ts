import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OccurrenceStatus } from 'src/types/occurrence';
import BaseSchema from '../../../BaseSchema';

export type OccurrenceDocument = HydratedDocument<Occurrence>;

@Schema({ timestamps: true })
export class Occurrence extends BaseSchema {
    @Prop({ required: true })
    scriptId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    scriptVersion: number;

    @Prop({ required: true })
    applicantName: string;

    @Prop({ required: true, default: 'CREATED' })
    status: OccurrenceStatus;

    @Prop()
    transcriptRaw?: string;

    @Prop()
    outputId?: mongoose.Types.ObjectId;

    @Prop()
    finishedAt?: Date;
}

export const OccurrenceSchema = SchemaFactory.createForClass(Occurrence);
