import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ScriptBlockType } from 'src/types/script';
import BaseSchema from '../../../BaseSchema';

export type ScriptBlockDocument = HydratedDocument<ScriptBlock>;

@Schema({ timestamps: true })
export class ScriptBlock extends BaseSchema {
    @Prop({ required: true })
    scriptId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    type: ScriptBlockType;

    @Prop({ required: true })
    content: string;

    @Prop()
    objective?: string;

    @Prop()
    expectedResponse?: string;

    @Prop()
    commonMistakes?: string;
}

export const ScriptBlockSchema = SchemaFactory.createForClass(ScriptBlock);
