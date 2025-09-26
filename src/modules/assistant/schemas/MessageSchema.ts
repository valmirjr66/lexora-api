import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MessageRole } from 'src/types/gen-ai';
import BaseSchema from '../../../BaseSchema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message extends BaseSchema {
    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    role: MessageRole;

    @Prop({ required: true })
    chatId: mongoose.Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
