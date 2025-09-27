import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    ScriptBlock,
    ScriptBlockSchema,
} from './modules/script/schemas/ScriptBlockSchema';
import { Script, ScriptSchema } from './modules/script/schemas/ScriptSchema';
import ScriptController from './modules/script/ScriptController';
import ScriptService from './modules/script/ScriptService';

@Module({
    controllers: [ScriptController],
    providers: [ScriptService],
    imports: [
        MongooseModule.forFeature([
            { name: Script.name, schema: ScriptSchema },
            { name: ScriptBlock.name, schema: ScriptBlockSchema },
        ]),
    ],
    exports: [ScriptService, MongooseModule],
})
export class ScriptModule {}
