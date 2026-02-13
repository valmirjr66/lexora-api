import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    ScriptBlock,
    ScriptBlockSchema,
} from './modules/script/schemas/ScriptBlockSchema';
import { Script, ScriptSchema } from './modules/script/schemas/ScriptSchema';
import ScriptBlockService from './modules/script/ScriptBlockService';

@Module({
    providers: [ScriptBlockService],
    imports: [
        MongooseModule.forFeature([
            { name: Script.name, schema: ScriptSchema },
            { name: ScriptBlock.name, schema: ScriptBlockSchema },
        ]),
    ],
    exports: [ScriptBlockService],
})
export class ScriptBlockModule {}
