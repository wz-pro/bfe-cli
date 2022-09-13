import { Injectable } from '@nestjs/common';
import { $MODULE_NAME_TOPEntity } from '../entity/$MODULE_NAME.entity';
import { Create$MODULE_NAME_TOPDto } from './dto/create.$MODULE_NAME.dto';
import { BaseService } from '../base/BaseService';

@Injectable()
export class $MODULE_NAME_TOPService extends BaseService<$MODULE_NAME_TOPEntity, Create$MODULE_NAME_TOPDto> {
  getEntity() {
    return new $MODULE_NAME_TOPEntity();
  }
}
