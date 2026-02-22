import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OccurrenceModule } from './occurrence.module';
import { ScriptModule } from './script.module';
import { UserModule } from './user.module';

@Module({
    imports: [
        UserModule,
        ScriptModule,
        OccurrenceModule,
        MongooseModule.forRoot(process.env.DATABASE_URL),
    ],
})
export class AppModule {}
