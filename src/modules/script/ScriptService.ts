import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import GetScriptResponseModel, {
    GetScriptBlockResponseModel,
} from './model/GetScriptResponseModel';
import InsertScriptRequestModel from './model/InsertScriptRequestModel';
import ListScriptsResponseModel from './model/ListScriptsResponseModel';
import UpdateScriptRequestModel from './model/UpdateScriptRequestModel';
import { ScriptBlock } from './schemas/ScriptBlockSchema';
import { Script } from './schemas/ScriptSchema';

@Injectable()
export default class ScriptService {
    private readonly logger = new Logger('ScriptService');

    constructor(
        @InjectModel(Script.name)
        private readonly scriptModel: Model<Script>,
        @InjectModel(Credential.name)
        private readonly scriptBlockModel: Model<ScriptBlock>,
    ) {}

    async getScriptById(id: string): Promise<GetScriptResponseModel | null> {
        this.logger.log(`Fetching script by id: ${id}`);

        try {
            const script = await this.scriptModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!script) {
                this.logger.error(`Script with id ${id} not found`);
                return null;
            }

            const scriptBlocks = await this.scriptBlockModel
                .find({ id: { $in: script.blockIds } })
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            this.logger.log(`Script fetched for id: ${id}`);
            this.logger.debug(`Script details: ${JSON.stringify(script)}`);

            return new GetScriptResponseModel(
                script._id.toString(),
                script.userId.toString(),
                script.title,
                scriptBlocks.map(
                    (block) =>
                        new GetScriptBlockResponseModel(
                            block._id.toString(),
                            block.type,
                            block.content,
                        ),
                ),
                script.createdAt,
                script.updatedAt,
            );
        } catch (error) {
            this.logger.error(`Error fetching script for id ${id}: ${error}`);
            throw error;
        }
    }

    async deleteScriptById(id: string): Promise<void> {
        this.logger.log(`Deleting script with id: ${id}`);

        try {
            const script = await this.scriptModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!script) {
                this.logger.error(`Script with id ${id} not found`);
                throw new NotFoundException();
            }

            await this.scriptBlockModel.deleteMany({
                id: { $in: script.blockIds },
            });

            this.logger.log(`Blocks deleted for script id: ${id}`);

            await this.scriptModel.deleteOne({ _id: script._id });

            this.logger.log(`Script with id ${id} deleted successfully`);
        } catch (error) {
            this.logger.error(`Error deleting script with id ${id}: ${error}`);
            throw error;
        }
    }

    async insertScript(
        model: InsertScriptRequestModel,
    ): Promise<'existing title' | { id: string }> {
        this.logger.log(`Inserting script with email: ${model.title}`);

        try {
            const scriptWithSameTitle = await this.scriptModel
                .findOne({
                    title: model.title,
                    userId: new mongoose.Types.ObjectId(model.userId),
                })
                .exec()
                .then((doc) => doc?.toObject());

            if (scriptWithSameTitle) {
                this.logger.warn(
                    `Script with title ${model.title} already exists`,
                );
                return 'existing title';
            }

            const createdScript = await this.scriptModel.create({
                _id: new mongoose.Types.ObjectId(),
                userId: new mongoose.Types.ObjectId(model.userId),
                title: model.title,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            this.logger.log(
                `Script with title ${model.title} created successfully with id ${createdScript._id}`,
            );

            return { id: createdScript.toObject()._id.toString() };
        } catch (error) {
            this.logger.error(
                `Error inserting script with title ${model.title}: ${error}`,
            );
            throw error;
        }
    }

    async updateScript(model: UpdateScriptRequestModel): Promise<void> {
        const { id } = model;

        this.logger.log(`Updating script with id: ${id}`);

        try {
            this.logger.log(`Fetching script with id: ${id}`);

            const script = await this.scriptModel
                .findById(new mongoose.Types.ObjectId(model.id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!script) {
                this.logger.error(`Script with id ${id} not found`);
                throw new NotFoundException();
            }

            await this.scriptModel.findByIdAndUpdate(script._id, {
                title: model.title,
                updatedAt: new Date(),
            });

            this.logger.log(`Title with id ${id} updated successfully`);
        } catch (error) {
            this.logger.error(`Error updating title with id ${id}: ${error}`);
            throw error;
        }
    }

    async listScripts(): Promise<ListScriptsResponseModel> {
        this.logger.log('Listing all scripts');

        try {
            const scripts = await this.scriptModel
                .find()
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            if (scripts.length === 0) {
                this.logger.warn('No script found');
                return new ListScriptsResponseModel([]);
            }

            const allBlockIds = scripts.flatMap((script) => script.blockIds);

            const scriptBlocks = await this.scriptBlockModel
                .find({ id: { $in: allBlockIds } })
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            this.logger.log(`Found ${scripts.length} scripts`);

            return new ListScriptsResponseModel(
                scripts.map(
                    (script) =>
                        new GetScriptResponseModel(
                            script._id.toString(),
                            script.userId.toString(),
                            script.title,
                            scriptBlocks
                                .filter((block) =>
                                    script.blockIds
                                        .map((blockId) => blockId.toString())
                                        .includes(block._id.toString()),
                                )
                                .map(
                                    (block) =>
                                        new GetScriptBlockResponseModel(
                                            block._id.toString(),
                                            block.type,
                                            block.content,
                                        ),
                                ),
                            script.createdAt,
                            script.updatedAt,
                        ),
                ),
            );
        } catch (error) {
            this.logger.error(`Error listing scripts: ${error}`);
            throw error;
        }
    }
}
