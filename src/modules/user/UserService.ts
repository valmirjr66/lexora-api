import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import BlobStorageManager from 'src/handlers/cloud/BlobStorageManager';
import { v4 as uuidv4 } from 'uuid';
import CoreCredentialService from './CoreCredentialService';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import ChangeProfilePictureRequestModel from './model/ChangeProfilePictureRequestModel';
import GetUserInfoResponseModel from './model/GetUserInfoResponseModel';
import InsertUserRequestModel from './model/InsertUserRequestModel';
import ListUsersInfoResponseModel from './model/ListUsersInfoResponseModel';
import UpdateUserRequestModel from './model/UpdateUserRequestModel';
import { Credential } from './schemas/CredentialSchema';
import { User } from './schemas/UserSchema';

@Injectable()
export default class UserService {
    private readonly coreCredentialService: CoreCredentialService;
    private readonly logger = new Logger('UserService');

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @InjectModel(Credential.name)
        private readonly credentialModel: Model<Credential>,
        private readonly blobStorageManager: BlobStorageManager,
    ) {
        this.coreCredentialService = new CoreCredentialService(
            this.credentialModel,
            this.logger,
        );
    }

    async authenticateUser(
        model: AuthenticateUserRequestModel,
    ): Promise<'invalid credentials' | 'email not found' | { id: string }> {
        return this.coreCredentialService.authenticateUser(model);
    }

    async changePassword(
        email: string,
        newPassword: string,
    ): Promise<'updated' | 'email not found'> {
        return this.coreCredentialService.changePassword(email, newPassword);
    }

    async getUserInfoById(
        id: string,
    ): Promise<GetUserInfoResponseModel | null> {
        this.logger.log(`Fetching user info for id: ${id}`);

        try {
            const user = await this.userModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!user) {
                this.logger.error(`User with id ${id} not found`);
                return null;
            }

            this.logger.log(
                `User info fetched for id: ${id} - fullname: ${user.fullname}`,
            );
            this.logger.debug(`User details: ${JSON.stringify(user)}`);

            return new GetUserInfoResponseModel(
                user._id.toString(),
                user.fullname,
                user.email,
                user.birthdate,
                user.profilePicFileName,
            );
        } catch (error) {
            this.logger.error(
                `Error fetching user info for id ${id}: ${error}`,
            );
            throw error;
        }
    }

    async deleteUserById(id: string): Promise<void> {
        this.logger.log(`Deleting user with id: ${id}`);

        try {
            const user = await this.userModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!user) {
                this.logger.error(`User with id ${id} not found`);
                throw new NotFoundException();
            }

            await this.credentialModel.deleteOne({
                userId: new mongoose.Types.ObjectId(id),
            });

            this.logger.log(`Credentials deleted for user id: ${id}`);

            await this.userModel.deleteOne({ _id: user._id });

            this.logger.log(`User with id ${id} deleted successfully`);

            if (user.profilePicFileName) {
                this.logger.log(
                    `Deleting profile picture for user with id ${id}: ${user.profilePicFileName}`,
                );

                await this.blobStorageManager.delete(
                    `profile_pics/${user.profilePicFileName}`,
                );

                this.logger.log(
                    `Profile picture deleted for user with id ${id}`,
                );
            }
        } catch (error) {
            this.logger.error(`Error deleting user with id ${id}: ${error}`);
            throw error;
        }
    }

    async insertUser(
        model: InsertUserRequestModel,
    ): Promise<'existing email' | 'existing phone number' | { id: string }> {
        this.logger.log(`Inserting user with email: ${model.email}`);

        try {
            const userWithSameEmail = await this.userModel
                .findOne({ email: model.email })
                .exec()
                .then((doc) => doc?.toObject());

            if (userWithSameEmail) {
                this.logger.warn(
                    `User with email ${model.email} already exists`,
                );
                return 'existing email';
            }

            const createdUser = await this.userModel.create({
                _id: new mongoose.Types.ObjectId(),
                fullname: model.fullname,
                email: model.email,
                birthdate: model.birthdate,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            this.logger.log(
                `User with email ${model.email} created successfully with id ${createdUser._id}`,
            );

            await this.credentialModel.create({
                _id: new mongoose.Types.ObjectId(),
                userId: createdUser.toObject()._id,
                email: model.email,
                password: model.password,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            this.logger.log(
                `User with email ${model.email} inserted successfully`,
            );
            return { id: createdUser.toObject()._id.toString() };
        } catch (error) {
            this.logger.error(
                `Error inserting user with email ${model.email}: ${error}`,
            );
            throw error;
        }
    }

    async updateUser(model: UpdateUserRequestModel): Promise<void> {
        const { id } = model;

        this.logger.log(`Updating user with id: ${id}`);

        try {
            this.logger.log(`Fetching user with id: ${id}`);

            const user = await this.userModel
                .findById(new mongoose.Types.ObjectId(model.id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!user) {
                this.logger.error(`User with id ${id} not found`);
                throw new NotFoundException();
            }

            await this.userModel.updateOne(
                {
                    _id: user._id,
                },
                {
                    fullname: model.fullname,
                    birthdate: model.birthdate,
                    email: model.email,
                    updatedAt: new Date(),
                },
            );

            this.logger.log(`User with id ${id} updated successfully`);
        } catch (error) {
            this.logger.error(`Error updating user with id ${id}: ${error}`);
            throw error;
        }
    }

    async listUsers(): Promise<ListUsersInfoResponseModel> {
        this.logger.log('Listing all users');

        try {
            const users = await this.userModel
                .find()
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            if (users.length === 0) {
                this.logger.warn('No users found');
                return new ListUsersInfoResponseModel([]);
            }

            this.logger.log(`Found ${users.length} users`);

            return new ListUsersInfoResponseModel(
                users.map(
                    (user) =>
                        new GetUserInfoResponseModel(
                            user._id.toString(),
                            user.fullname,
                            user.email,
                            user.birthdate,
                            user.profilePicFileName,
                        ),
                ),
            );
        } catch (error) {
            this.logger.error(`Error listing users: ${error}`);
            throw error;
        }
    }

    async changeProfilePicture(model: ChangeProfilePictureRequestModel) {
        this.logger.log(
            `Changing profile picture for user with id: ${model.userId}`,
        );

        try {
            const fileExtension = model.profilePicture.originalname
                .split('.')
                .pop();
            const profilePicFileName = `${uuidv4()}.${fileExtension}`;

            this.logger.log(
                `Uploading new profile picture for user with id ${model.userId}: ${profilePicFileName}`,
            );

            await this.blobStorageManager.write(
                `profile_pics/${profilePicFileName}`,
                model.profilePicture.buffer,
            );

            await this.userModel.updateOne(
                { _id: new mongoose.Types.ObjectId(model.userId) },
                {
                    $set: {
                        profilePicFileName,
                    },
                },
            );

            this.logger.log(
                `Profile picture updated for user with id ${model.userId}: ${profilePicFileName}`,
            );
        } catch (error) {
            this.logger.error(
                `Error changing profile picture for user with id ${model.userId}: ${error}`,
            );
            throw error;
        }
    }

    async removeProfilePicture(userId: string): Promise<void> {
        this.logger.log(`Removing profile picture for user with id: ${userId}`);

        try {
            const user = await this.userModel
                .findById(new mongoose.Types.ObjectId(userId))
                .exec();

            if (!user) {
                this.logger.error(`User with id ${userId} not found`);
                return;
            }

            if (user.profilePicFileName) {
                this.logger.log(
                    `Deleting profile picture for user with id ${userId}: ${user.profilePicFileName}`,
                );

                await this.userModel.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            profilePicFileName: null,
                        },
                    },
                );

                this.logger.log(
                    `Profile picture removed for user with id ${userId}`,
                );
            } else {
                this.logger.log(
                    `No profile picture to remove for user with id ${userId}`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Error removing profile picture for user with id ${userId}: ${error}`,
            );
            throw error;
        }
    }
}
