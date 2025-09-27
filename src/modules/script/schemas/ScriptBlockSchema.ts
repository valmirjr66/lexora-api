import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ScriptBlockType } from 'src/types/script';
import BaseSchema from '../../../BaseSchema';

export type ScriptBlockDocument = HydratedDocument<ScriptBlock>;

@Schema({ timestamps: true })
export class ScriptBlock extends BaseSchema {
    @Prop({ required: true })
    type: ScriptBlockType;

    @Prop({ required: true })
    content: string;
}

export const ScriptBlockSchema = SchemaFactory.createForClass(ScriptBlock);
