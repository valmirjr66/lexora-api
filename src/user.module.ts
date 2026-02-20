import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UserController from './modules/user/UserController';
import {
    Credential,
    CredentialSchema,
} from './modules/user/schemas/CredentialSchema';
import { User, UserSchema } from './modules/user/schemas/UserSchema';
import UserService from './modules/user/UserService';

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Credential.name, schema: CredentialSchema },
        ]),
    ],
    exports: [UserService, MongooseModule],
})
export class UserModule {}
