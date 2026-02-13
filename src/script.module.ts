import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Script, ScriptSchema } from './modules/script/schemas/ScriptSchema';
import ScriptController from './modules/script/ScriptController';
import ScriptService from './modules/script/ScriptService';
import { ScriptBlockModule } from './script-block.module';

@Module({
    controllers: [ScriptController],
    providers: [ScriptService],
    imports: [
        ScriptBlockModule,
        MongooseModule.forFeature([
            { name: Script.name, schema: ScriptSchema },
        ]),
    ],
    exports: [ScriptService, MongooseModule],
})
export class ScriptModule {}
