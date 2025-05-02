import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task/task.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TaskModule, DbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
