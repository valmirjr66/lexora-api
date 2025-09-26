import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import { Credential } from './schemas/CredentialSchema';

export default class CoreCredentialService {
    constructor(
        private readonly credentialModel: Model<Credential>,
        private readonly logger: Logger,
    ) {}

    async authenticateUser(
        model: AuthenticateUserRequestModel,
    ): Promise<'invalid credentials' | 'email not found' | { id: string }> {
        this.logger.log(
            `Authenticating user with email "${model.email}" and password "${model.password}"`,
        );

        try {
            const credential = await this.credentialModel.findOne({
                email: model.email,
            });

            if (credential) {
                this.logger.log(`Credential found for email: ${model.email}`);

                if (credential.password === model.password) {
                    this.logger.log(
                        `User with email ${model.email} authenticated successfully`,
                    );

                    return { id: credential.toObject().userId.toString() };
                } else {
                    this.logger.warn(
                        `Invalid credentials for email: ${model.email}`,
                    );
                    return 'invalid credentials';
                }
            } else {
                this.logger.warn(`Email not found: ${model.email}`);
                return 'email not found';
            }
        } catch (error) {
            this.logger.error(
                `Error authenticating user with email ${model.email}: ${error}`,
            );
            throw error;
        }
    }

    async changePassword(
        email: string,
        newPassword: string,
    ): Promise<'updated' | 'email not found'> {
        this.logger.log(`Updating password for user with email: ${email}`);

        try {
            const credentials = await this.credentialModel
                .findOne({ email })
                .exec()
                .then((doc) => doc?.toObject());

            if (!credentials) {
                this.logger.error(`User with email ${email} not found`);
                return 'email not found';
            }

            await this.credentialModel.updateOne(
                { email },
                { email, password: newPassword, updatedAt: new Date() },
            );

            this.logger.log(`Password updated for user with email: ${email}`);

            return 'updated';
        } catch (error) {
            this.logger.error(
                `Error updating password for user with email ${email}: ${error}`,
            );
            throw error;
        }
    }
}
