import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BlobStorageManager from './handlers/cloud/BlobStorageManager';
import UserController from './modules/user/UserController';
import {
    Credential,
    CredentialSchema,
} from './modules/user/schemas/CredentialSchema';
import { User, UserSchema } from './modules/user/schemas/UserSchema';
import UserService from './modules/user/UserService';

@Module({
    controllers: [UserController],
    providers: [UserService, BlobStorageManager],
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Credential.name, schema: CredentialSchema },
        ]),
    ],
    exports: [UserService, BlobStorageManager, MongooseModule],
})
export class UserModule {}
