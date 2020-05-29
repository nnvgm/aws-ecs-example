import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Get,
  Param,
  Query,
} from '@nestjs/common';

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

  @Get('/task/describe/:id')
  async describeTask(@Param('id') id: string) {
    return await this.awsService.describeTask(id);
  }
  @Post('/task')
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return await this.awsService.createTask(createTaskDto);
  }

  @Get('/service')
  async getService(
    @Query('cluster') cluster: string,
    @Query('type') type: string,
  ) {
    return await this.awsService.getServices(cluster, type);
  }

  @Get('/service/describe')
  async describeService(
    @Query('cluster') cluster: string,
    @Param('id') id: string,
  ) {
    return await this.awsService.describeService(cluster, id);
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
