import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { $MODULE_NAME_TOPEntity } from '../entity/$MODULE_NAME.entity';
import { $MODULE_NAME_TOPController } from './$MODULE_NAME.controller';
import { $MODULE_NAME_TOPService } from './$MODULE_NAME.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([$MODULE_NAME_TOPEntity])
  ],
  controllers: [$MODULE_NAME_TOPController],
  providers: [$MODULE_NAME_TOPService],
})
export class $MODULE_NAME_TOPModule {}
