import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type ScriptDocument = HydratedDocument<Script>;

@Schema({ timestamps: true })
export class Script extends BaseSchema {
    @Prop({ required: true })
    userId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    blockIds: mongoose.Types.ObjectId[];
}

export const ScriptSchema = SchemaFactory.createForClass(Script);
