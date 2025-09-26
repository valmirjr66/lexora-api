import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantModule } from './assistant.module';
import { UserModule } from './user.module';

@Module({
    imports: [
        AssistantModule,
        UserModule,
        MongooseModule.forRoot(process.env.DATABASE_URL),
    ],
})
export class AppModule {}
