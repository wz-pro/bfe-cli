import { Put, Get, Body, Controller, Post, Query } from '@nestjs/common';
import { $MODULE_NAME_TOPService } from './$MODULE_NAME.service';
import { Create$MODULE_NAME_TOPDto } from './dto/create.$MODULE_NAME.dto';
import { Update$MODULE_NAME_TOPDto } from './dto/update.$MODULE_NAME.dto';
import { $MODULE_NAME_TOPListQueryDto } from './dto/$MODULE_NAME.list.query.dto';
import { $MODULE_NAME_TOPQueryDto } from './dto/$MODULE_NAME.query.dto';

@Controller('/api/$MODULE_NAME')
export class $MODULE_NAME_TOPController {
  constructor(private $MODULE_NAMEService: $MODULE_NAME_TOPService) {}

  @Get('/list')
  getDockerList(@Query() query: $MODULE_NAME_TOPListQueryDto) {
    return this.$MODULE_NAMEService.list(query);
  }

  @Post('/')
  createDocker(@Body() params: Create$MODULE_NAME_TOPDto) {
    return this.$MODULE_NAMEService.add(params);
  }

  @Put('/')
  updateDocker(@Body() params: Update$MODULE_NAME_TOPDto) {
    return this.$MODULE_NAMEService.update(params);
  }

  @Get('/detail')
  getDocker(@Query() query: $MODULE_NAME_TOPQueryDto) {
    const { netId } = query;
    return this.$MODULE_NAMEService.detail(netId);
  }
}
