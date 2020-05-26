import { Controller, Post, Put, Delete, Body } from '@nestjs/common';

import { AwsService } from './aws.service';
import {
  CreateTaskDto,
  CreateServiceDto,
  UpdateServiceStateDto,
  DeleteServiceDto,
} from './aws.dto';

@Controller('aws')
export class AwsController {
  constructor(private awsService: AwsService) {}

  @Post('/task')
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return await this.awsService.createTask(createTaskDto);
  }

  @Post('/service')
  async createService(@Body() createServiceDto: CreateServiceDto) {
    return await this.awsService.createService(createServiceDto);
  }

  @Put('/service/state')
  async updateService(@Body() updateServiceDto: UpdateServiceStateDto) {
    return await this.awsService.updateServiceState(updateServiceDto);
  }

  @Delete('/service')
  async deleteService(@Body() deleteServiceDto: DeleteServiceDto) {
    return await this.awsService.deleteService(deleteServiceDto);
  }
}
