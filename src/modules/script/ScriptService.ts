import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import GetScriptResponseModel from './model/GetScriptResponseModel';
import InsertScriptRequestModel from './model/InsertScriptRequestModel';
import ListScriptsResponseModel from './model/ListScriptsResponseModel';
import UpdateScriptRequestModel from './model/UpdateScriptRequestModel';
import ScriptBlockService from './ScriptBlockService';
import { Script } from './schemas/ScriptSchema';

@Injectable()
export default class ScriptService {
    private readonly logger = new Logger('ScriptService');

    constructor(
        @InjectModel(Script.name)
        private readonly scriptModel: Model<Script>,
        private readonly scriptBlockService: ScriptBlockService,
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

            const blocks = await this.scriptBlockService.findByIds(
                script.blockIds,
            );

            this.logger.log(`Script fetched for id: ${id}`);
            this.logger.debug(`Script details: ${JSON.stringify(script)}`);

            return new GetScriptResponseModel(
                script._id.toString(),
                script.owner.toString(),
                script.title,
                script.type,
                script.version,
                script.description,
                blocks,
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

            await this.scriptBlockService.deleteByScriptId(script.blockIds);

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
        this.logger.log(`Inserting script with title: ${model.title}`);

        try {
            const scriptWithSameTitle = await this.scriptModel
                .findOne({
                    title: model.title,
                    owner: new mongoose.Types.ObjectId(model.owner),
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
                owner: new mongoose.Types.ObjectId(model.owner),
                title: model.title,
                type: model.type,
                version: 1,
                description: model.description,
                blockIds: [],
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
            const script = await this.scriptModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!script) {
                this.logger.error(`Script with id ${id} not found`);
                throw new NotFoundException();
            }

            const updatePayload: Record<string, any> = {
                updatedAt: new Date(),
                version: script.version + 1,
            };

            if (model.title !== undefined) updatePayload.title = model.title;
            if (model.type !== undefined) updatePayload.type = model.type;
            if (model.description !== undefined)
                updatePayload.description = model.description;

            await this.scriptModel.findByIdAndUpdate(script._id, updatePayload);

            this.logger.log(
                `Script with id ${id} updated successfully to version ${updatePayload.version}`,
            );
        } catch (error) {
            this.logger.error(`Error updating script with id ${id}: ${error}`);
            throw error;
        }
    }

    async listScripts(owner?: string): Promise<ListScriptsResponseModel> {
        this.logger.log('Listing all scripts');

        const filter: Record<string, any> = {};
        if (owner) filter['owner'] = new mongoose.Types.ObjectId(owner);

        try {
            const scripts = await this.scriptModel
                .find({ ...filter })
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            if (scripts.length === 0) {
                this.logger.warn('No script found');
                return new ListScriptsResponseModel([]);
            }

            const allBlockIds = scripts.flatMap((script) => script.blockIds);

            const allBlocks =
                await this.scriptBlockService.findByIds(allBlockIds);

            this.logger.log(
                `Found ${scripts.length} scripts and ${allBlocks.length} blocks`,
            );

            return new ListScriptsResponseModel(
                scripts.map(
                    (script) =>
                        new GetScriptResponseModel(
                            script._id.toString(),
                            script.owner.toString(),
                            script.title,
                            script.type,
                            script.version,
                            script.description,
                            allBlocks.filter((block) =>
                                script.blockIds
                                    .map((blockId) => blockId.toString())
                                    .includes(block.id),
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
