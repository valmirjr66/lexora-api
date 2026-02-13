import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ScriptType } from 'src/types/script';
import BaseSchema from '../../../BaseSchema';

export type ScriptDocument = HydratedDocument<Script>;

@Schema({ timestamps: true })
export class Script extends BaseSchema {
    @Prop({ required: true })
    owner: mongoose.Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true, default: 'TECHNICAL_INTERVIEW' })
    type: ScriptType;

    @Prop({ required: true, default: 1 })
    version: number;

    @Prop()
    description?: string;

    @Prop({ required: true, default: [] })
    blockIds: mongoose.Types.ObjectId[];
}

export const ScriptSchema = SchemaFactory.createForClass(Script);
