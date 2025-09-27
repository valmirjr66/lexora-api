import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantModule } from './assistant.module';
import { ScriptModule } from './script.module';
import { UserModule } from './user.module';

@Module({
    imports: [
        AssistantModule,
        UserModule,
        ScriptModule,
        MongooseModule.forRoot(process.env.DATABASE_URL),
    ],
})
export class AppModule {}
