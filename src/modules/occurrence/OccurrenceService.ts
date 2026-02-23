import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Script } from '../script/schemas/ScriptSchema';
import GetOccurrenceResponseModel from './model/GetOccurrenceResponseModel';
import InsertOccurrenceRequestModel from './model/InsertOccurrenceRequestModel';
import ListOccurrencesResponseModel from './model/ListOccurrencesResponseModel';
import UpdateOccurrenceRequestModel from './model/UpdateOccurrenceRequestModel';
import { Occurrence } from './schemas/OccurrenceSchema';

@Injectable()
export default class OccurrenceService {
    private readonly logger = new Logger('OccurrenceService');

    constructor(
        @InjectModel(Occurrence.name)
        private readonly occurrenceModel: Model<Occurrence>,
        @InjectModel(Script.name)
        private readonly scriptModel: Model<Script>,
    ) {}

    async listByScriptId(
        scriptId: string,
    ): Promise<ListOccurrencesResponseModel> {
        this.logger.log(`Listing occurrences for script id: ${scriptId}`);

        try {
            const script = await this.scriptModel
                .findById(new mongoose.Types.ObjectId(scriptId))
                .exec()
                .then((doc) => doc?.toObject());

            if (!script) {
                this.logger.error(`Script with id ${scriptId} not found`);
                throw new NotFoundException();
            }

            const occurrences = await this.occurrenceModel
                .find({ scriptId: new mongoose.Types.ObjectId(scriptId) })
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            this.logger.log(
                `Found ${occurrences.length} occurrences for script id: ${scriptId}`,
            );

            return new ListOccurrencesResponseModel(
                occurrences.map((occ) => this.toResponseModel(occ)),
            );
        } catch (error) {
            this.logger.error(
                `Error listing occurrences for script id ${scriptId}: ${error}`,
            );
            throw error;
        }
    }

    async insert(model: InsertOccurrenceRequestModel): Promise<{ id: string }> {
        const { scriptId, applicantName } = model;

        this.logger.log(`Inserting occurrence for script id: ${scriptId}`);

        try {
            const script = await this.scriptModel
                .findById(new mongoose.Types.ObjectId(scriptId))
                .exec()
                .then((doc) => doc?.toObject());

            if (!script) {
                this.logger.error(`Script with id ${scriptId} not found`);
                throw new NotFoundException();
            }

            const now = new Date();

            const createdOccurrence = await this.occurrenceModel.create({
                _id: new mongoose.Types.ObjectId(),
                scriptId: new mongoose.Types.ObjectId(scriptId),
                applicantName,
                status: 'CREATED',
                createdAt: now,
                updatedAt: now,
            });

            this.logger.log(
                `Occurrence created successfully with id ${createdOccurrence._id} for script id ${scriptId}`,
            );

            return { id: createdOccurrence.toObject()._id.toString() };
        } catch (error) {
            this.logger.error(
                `Error inserting occurrence for script id ${scriptId}: ${error}`,
            );
            throw error;
        }
    }

    async update(model: UpdateOccurrenceRequestModel): Promise<void> {
        const { id } = model;

        this.logger.log(`Updating occurrence with id: ${id}`);

        try {
            const occurrence = await this.occurrenceModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!occurrence) {
                this.logger.error(`Occurrence with id ${id} not found`);
                throw new NotFoundException();
            }

            await this.occurrenceModel.findByIdAndUpdate(occurrence._id, {
                applicantName: model.applicantName,
                status: model.status,
                transcriptRaw: model.transcriptRaw ?? null,
                outputId: model.outputId
                    ? new mongoose.Types.ObjectId(model.outputId)
                    : null,
                finishedAt: model.finishedAt ?? null,
                updatedAt: new Date(),
            });

            this.logger.log(`Occurrence with id ${id} updated successfully`);
        } catch (error) {
            this.logger.error(
                `Error updating occurrence with id ${id}: ${error}`,
            );
            throw error;
        }
    }

    async delete(scriptId: string, occurrenceId: string): Promise<void> {
        this.logger.log(
            `Deleting occurrence with id ${occurrenceId} from script id: ${scriptId}`,
        );

        try {
            const occurrence = await this.occurrenceModel
                .findById(new mongoose.Types.ObjectId(occurrenceId))
                .exec()
                .then((doc) => doc?.toObject());

            if (!occurrence) {
                this.logger.error(
                    `Occurrence with id ${occurrenceId} not found`,
                );
                throw new NotFoundException();
            }

            if (occurrence.scriptId.toString() !== scriptId) {
                this.logger.error(
                    `Occurrence with id ${occurrenceId} does not belong to script id ${scriptId}`,
                );
                throw new NotFoundException();
            }

            await this.occurrenceModel.deleteOne({
                _id: new mongoose.Types.ObjectId(occurrenceId),
            });

            this.logger.log(
                `Occurrence with id ${occurrenceId} deleted successfully`,
            );
        } catch (error) {
            this.logger.error(
                `Error deleting occurrence with id ${occurrenceId}: ${error}`,
            );
            throw error;
        }
    }

    private toResponseModel(
        occ: Occurrence & { _id: mongoose.Types.ObjectId },
    ): GetOccurrenceResponseModel {
        return new GetOccurrenceResponseModel(
            occ._id.toString(),
            occ.scriptId.toString(),
            occ.applicantName,
            occ.status,
            occ.transcriptRaw,
            occ.outputId?.toString(),
            occ.createdAt,
            occ.finishedAt,
        );
    }
}
