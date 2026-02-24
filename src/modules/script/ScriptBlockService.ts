import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { GetScriptBlockResponseModel } from './model/GetScriptResponseModel';
import InsertScriptBlockRequestModel from './model/InsertScriptBlockRequestModel';
import ListScriptBlocksResponseModel from './model/ListScriptBlocksResponseModel';
import UpdateScriptBlockRequestModel from './model/UpdateScriptBlockRequestModel';
import { ScriptBlock } from './schemas/ScriptBlockSchema';
import { Script } from './schemas/ScriptSchema';

@Injectable()
export default class ScriptBlockService {
    private readonly logger = new Logger('ScriptBlockService');

    constructor(
        @InjectModel(ScriptBlock.name)
        private readonly scriptBlockModel: Model<ScriptBlock>,
        @InjectModel(Script.name)
        private readonly scriptModel: Model<Script>,
    ) {}

    async listByScriptId(
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
                            block.order,
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

    async findByIds(
        blockIds: mongoose.Types.ObjectId[],
    ): Promise<GetScriptBlockResponseModel[]> {
        const blocks = await this.scriptBlockModel
            .find({ _id: { $in: blockIds } })
            .exec()
            .then((docs) => docs.map((doc) => doc.toObject()));

        return blocks.map(
            (block) =>
                new GetScriptBlockResponseModel(
                    block._id.toString(),
                    block.scriptId.toString(),
                    block.type,
                    block.order,
                    block.content,
                    block.objective,
                    block.expectedResponse,
                    block.commonMistakes,
                    block.createdAt,
                    block.updatedAt,
                ),
        );
    }

    async insert(
        model: InsertScriptBlockRequestModel,
    ): Promise<{ id: string }> {
        const {
            scriptId,
            type,
            order,
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
                order,
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

    async update(model: UpdateScriptBlockRequestModel): Promise<void> {
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

            await this.scriptBlockModel.findByIdAndUpdate(block._id, {
                type: model.type,
                order: model.order,
                content: model.content,
                objective: model.objective ?? null,
                expectedResponse: model.expectedResponse ?? null,
                commonMistakes: model.commonMistakes ?? null,
            });

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

    async delete(scriptId: string, blockId: string): Promise<void> {
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

    async deleteByScriptId(
        blockIds: mongoose.Types.ObjectId[],
        session?: mongoose.ClientSession,
    ): Promise<void> {
        await this.scriptBlockModel.deleteMany(
            { _id: { $in: blockIds } },
            { session },
        );
    }
}
