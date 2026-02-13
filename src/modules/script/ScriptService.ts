import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import GetScriptResponseModel, {
    GetScriptBlockResponseModel,
} from './model/GetScriptResponseModel';
import InsertScriptBlockRequestModel from './model/InsertScriptBlockRequestModel';
import InsertScriptRequestModel from './model/InsertScriptRequestModel';
import ListScriptBlocksResponseModel from './model/ListScriptBlocksResponseModel';
import ListScriptsResponseModel from './model/ListScriptsResponseModel';
import UpdateScriptBlockRequestModel from './model/UpdateScriptBlockRequestModel';
import UpdateScriptRequestModel from './model/UpdateScriptRequestModel';
import { ScriptBlock } from './schemas/ScriptBlockSchema';
import { Script } from './schemas/ScriptSchema';

@Injectable()
export default class ScriptService {
    private readonly logger = new Logger('ScriptService');

    constructor(
        @InjectModel(Script.name)
        private readonly scriptModel: Model<Script>,
        @InjectModel(ScriptBlock.name)
        private readonly scriptBlockModel: Model<ScriptBlock>,
    ) { }

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
                .find({ _id: { $in: script.blockIds } })
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            this.logger.log(`Script fetched for id: ${id}`);
            this.logger.debug(`Script details: ${JSON.stringify(script)}`);

            return new GetScriptResponseModel(
                script._id.toString(),
                script.owner.toString(),
                script.title,
                script.type,
                script.version,
                script.description,
                scriptBlocks.map(
                    (block) =>
                        new GetScriptBlockResponseModel(
                            block._id.toString(),
                            block.scriptId.toString(),
                            block.type,
                            block.content,
                            block.objective,
                            block.expectedResponse,
                            block.commonMistakes,
                            block.createdAt,
                            block.updatedAt,
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
                _id: { $in: script.blockIds },
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

            const scriptBlocks = await this.scriptBlockModel
                .find({ _id: { $in: allBlockIds } })
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            this.logger.log(
                `Found ${scripts.length} scripts and ${scriptBlocks.length} blocks`,
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
                                            block.scriptId.toString(),
                                            block.type,
                                            block.content,
                                            block.objective,
                                            block.expectedResponse,
                                            block.commonMistakes,
                                            block.createdAt,
                                            block.updatedAt,
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

    async listScriptBlocks(
        scriptId: string,
    ): Promise<ListScriptBlocksResponseModel> {
        this.logger.log(`Listing blocks for script id: ${scriptId}`);

        try {
            const script = await this.scriptModel
                .findById(new mongoose.Types.ObjectId(scriptId))
                .exec()
                .then((doc) => doc?.toObject());

            if (!script) {
                this.logger.error(`Script with id ${scriptId} not found`);
                throw new NotFoundException();
            }

            const scriptBlocks = await this.scriptBlockModel
                .find({ _id: { $in: script.blockIds } })
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            this.logger.log(
                `Found ${scriptBlocks.length} blocks for script id: ${scriptId}`,
            );

            return new ListScriptBlocksResponseModel(
                scriptBlocks.map(
                    (block) =>
                        new GetScriptBlockResponseModel(
                            block._id.toString(),
                            block.scriptId.toString(),
                            block.type,
                            block.content,
                            block.objective,
                            block.expectedResponse,
                            block.commonMistakes,
                            block.createdAt,
                            block.updatedAt,
                        ),
                ),
            );
        } catch (error) {
            this.logger.error(
                `Error listing blocks for script id ${scriptId}: ${error}`,
            );
            throw error;
        }
    }

    async insertScriptBlock(
        model: InsertScriptBlockRequestModel,
    ): Promise<{ id: string }> {
        const {
            scriptId,
            type,
            content,
            objective,
            expectedResponse,
            commonMistakes,
        } = model;

        this.logger.log(`Inserting script block for script id: ${scriptId}`);

        try {
            const script = await this.scriptModel
                .findById(new mongoose.Types.ObjectId(scriptId))
                .exec()
                .then((doc) => doc?.toObject());

            if (!script) {
                this.logger.error(`Script with id ${scriptId} not found`);
                throw new NotFoundException();
            }

            const createdBlock = await this.scriptBlockModel.create({
                _id: new mongoose.Types.ObjectId(),
                scriptId: new mongoose.Types.ObjectId(scriptId),
                type,
                content,
                objective,
                expectedResponse,
                commonMistakes,
            });

            this.logger.log(
                `Script block created successfully with id ${createdBlock._id}`,
            );

            script.blockIds.push(createdBlock._id);

            await this.scriptModel.findByIdAndUpdate(script._id, {
                blockIds: script.blockIds,
                updatedAt: new Date(),
            });

            this.logger.log(
                `Script with id ${scriptId} updated with new block id ${createdBlock._id}`,
            );

            return { id: createdBlock.toObject()._id.toString() };
        } catch (error) {
            this.logger.error(
                `Error inserting script block for script id ${scriptId}: ${error}`,
            );
            throw error;
        }
    }

    async deleteScriptBlock(scriptId: string, blockId: string): Promise<void> {
        this.logger.log(
            `Removing script block with id ${blockId} from script id: ${scriptId}`,
        );

        try {
            const script = await this.scriptModel
                .findById(new mongoose.Types.ObjectId(scriptId))
                .exec()
                .then((doc) => doc?.toObject());

            if (!script) {
                this.logger.error(`Script with id ${scriptId} not found`);
                throw new NotFoundException();
            }

            if (!script.blockIds.map((id) => id.toString()).includes(blockId)) {
                this.logger.error(
                    `Block with id ${blockId} not found in script id ${scriptId}`,
                );
                throw new NotFoundException();
            }

            await this.scriptBlockModel.deleteOne({
                _id: new mongoose.Types.ObjectId(blockId),
            });

            this.logger.log(`Block with id ${blockId} deleted successfully`);

            script.blockIds = script.blockIds.filter(
                (id) => id.toString() !== blockId,
            );

            await this.scriptModel.findByIdAndUpdate(script._id, {
                blockIds: script.blockIds,
                updatedAt: new Date(),
            });

            this.logger.log(
                `Script with id ${scriptId} updated successfully after removing block id ${blockId}`,
            );
        } catch (error) {
            this.logger.error(
                `Error removing block with id ${blockId} from script id ${scriptId}: ${error}`,
            );
            throw error;
        }
    }

    async updateScriptBlock(
        model: UpdateScriptBlockRequestModel,
    ): Promise<void> {
        this.logger.log(`Updating script block with id: ${model.blockId}`);

        try {
            const block = await this.scriptBlockModel
                .findById(new mongoose.Types.ObjectId(model.blockId))
                .exec()
                .then((doc) => doc?.toObject());

            if (!block) {
                this.logger.error(`Block with id ${model.blockId} not found`);
                throw new NotFoundException();
            }

            const updatePayload: Record<string, any> = {};

            if (model.type !== undefined) updatePayload.type = model.type;
            if (model.content !== undefined)
                updatePayload.content = model.content;
            if (model.objective !== undefined)
                updatePayload.objective = model.objective;
            if (model.expectedResponse !== undefined)
                updatePayload.expectedResponse = model.expectedResponse;
            if (model.commonMistakes !== undefined)
                updatePayload.commonMistakes = model.commonMistakes;

            await this.scriptBlockModel.findByIdAndUpdate(
                block._id,
                updatePayload,
            );

            this.logger.log(
                `Block with id ${model.blockId} updated successfully`,
            );
        } catch (error) {
            this.logger.error(
                `Error updating block with id ${model.blockId}: ${error}`,
            );
            throw error;
        }
    }
}
