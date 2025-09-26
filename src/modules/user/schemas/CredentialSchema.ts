import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type CredentialDocument = HydratedDocument<Credential>;

@Schema({ timestamps: true })
export class Credential extends BaseSchema {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;
}

export const CredentialSchema = SchemaFactory.createForClass(Credential);
