import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type LexoraChatDocument = HydratedDocument<LexoraChat>;

@Schema({ timestamps: true })
export class LexoraChat extends BaseSchema {
    @Prop({ required: true })
    userId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    threadId: string;
}

export const LexoraChatSchema = SchemaFactory.createForClass(LexoraChat);
