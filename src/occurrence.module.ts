import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import OccurrenceController from './modules/occurrence/OccurrenceController';
import OccurrenceService from './modules/occurrence/OccurrenceService';
import {
    Occurrence,
    OccurrenceSchema,
} from './modules/occurrence/schemas/OccurrenceSchema';
import { Script, ScriptSchema } from './modules/script/schemas/ScriptSchema';

@Module({
    controllers: [OccurrenceController],
    providers: [OccurrenceService],
    imports: [
        MongooseModule.forFeature([
            { name: Occurrence.name, schema: OccurrenceSchema },
            { name: Script.name, schema: ScriptSchema },
        ]),
    ],
    exports: [OccurrenceService, MongooseModule],
})
export class OccurrenceModule {}
