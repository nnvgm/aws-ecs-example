import { Injectable, BadRequestException } from '@nestjs/common';
import { ECS, ELBv2 } from 'aws-sdk';

import {
  CreateTaskDto,
  CreateServiceDto,
  UpdateServiceStateDto,
  DeleteServiceDto,
} from './aws.dto';

@Injectable()
export class AwsService {
  private ecs = new ECS({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  private elbv2 = new ELBv2({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  async describeTask(
    task: string,
  ): Promise<ECS.DescribeTaskDefinitionResponse> {
    const params = {
      taskDefinition: task,
    };

    return await this.ecs.describeTaskDefinition(params).promise();
  }

  async createTask(createTaskDto: CreateTaskDto) {
    const { name, image, tag, containerPort, hostPort } = createTaskDto;

    const params: ECS.RegisterTaskDefinitionRequest = {
      family: name,
      ipcMode: null,
      executionRoleArn: process.env.AWS_EXE_ROLE_ARN, // env process.env.AWS_EXE_ROLE_ARN
      containerDefinitions: [
        {
          // logConfiguration: {
          //   logDriver: '',
          //   secretOptions: null,
          //   options: {
          //     'awslogs-group': '',
          //     'awslogs-region': '',
          //     'awslogs-stream-prefix': 'ecs',
          //   },
          // },
          portMappings: [
            {
              hostPort,
              protocol: 'tcp',
              containerPort,
            },
          ],
          cpu: 0,
          environment: [
            // env
          ],
          repositoryCredentials: {
            credentialsParameter: process.env.CREDENTIALS_PARAMETER, // token request repository
          },
          memoryReservation: 200,
          image: `${image}:${tag}`, // hard -> env
          essential: true,
          name: `${name}-container`, // params
        },
      ],
      taskRoleArn: process.env.AWS_EXE_ROLE_ARN,
      requiresCompatibilities: ['EC2'],
      networkMode: 'bridge',
    };

    return await this.ecs.registerTaskDefinition(params).promise();
  }

  async getServices(
    cluster: string,
    type: string,
  ): Promise<ECS.ListServicesResponse> {
    const params = {
      cluster,
      launchType: type,
      maxResults: 50,
    };

    return await this.ecs.listServices(params).promise();
  }

  async describeService(
    cluster: string,
    service: string,
  ): Promise<ECS.DescribeServicesResponse> {
    const params = {
      cluster,
      services: [service],
    };

    return await this.ecs.describeServices(params).promise();
  }

  async createService(createServiceDto: CreateServiceDto) {
    const {
      cluster, // env
      desiredCount, // 1
      taskDefinition, // truyen
      port,
      name,
      capacityProvider,
    } = createServiceDto;

    const { TargetGroups } = await this.createTargetGroup(port, `${name}`);
    const [targetArn] = TargetGroups;

    if (!targetArn) {
      throw new BadRequestException('Bad Request');
    }

    const params: ECS.CreateServiceRequest = {
      capacityProviderStrategy: [
        {
          capacityProvider,
          weight: 1,
        },
      ],
      serviceName: `${name}-svc`, // domain_name_svc
      cluster, // constant // env
      desiredCount, // 1 || 0 // 1 = start 0 = off
      placementStrategy: [
        {
          field: 'memory',
          type: 'binpack',
        },
      ],
      healthCheckGracePeriodSeconds: 60,
      taskDefinition: taskDefinition,
      loadBalancers: [
        {
          containerName: `${name}-container`,
          containerPort: Number(port),
          targetGroupArn: targetArn.TargetGroupArn,
        },
      ],
      role: process.env.SERVICE_ROLE, // env
      serviceRegistries: [],
    };

    return await this.ecs.createService(params).promise();
  }

  async updateServiceState(updateServiceDto: UpdateServiceStateDto) {
    const { desiredCount, service, cluster } = updateServiceDto;

    const params: ECS.UpdateServiceRequest = {
      desiredCount,
      service,
      cluster,
    };

    return await this.ecs.updateService(params).promise();
  }

  async deleteService(
    deleteServiceDto: DeleteServiceDto,
  ): Promise<ECS.DeleteServiceResponse> {
    const { service, cluster } = deleteServiceDto;

    const params: ECS.DeleteServiceRequest = {
      service,
      cluster,
      force: true,
    };

    return await this.ecs.deleteService(params).promise();
  }

  async createTargetGroup(
    port: string,
    name: string,
  ): Promise<ELBv2.Types.CreateTargetGroupOutput> {
    const params: ELBv2.Types.CreateTargetGroupInput = {
      Name: name,
      Protocol: 'HTTP',
      Port: Number(port),
      VpcId: 'vpc-5921223e', // env
      HealthCheckProtocol: 'HTTP',
      HealthCheckPort: port,
      HealthCheckPath: '/',
      HealthCheckEnabled: true,
      HealthCheckIntervalSeconds: 30,
      TargetType: 'ip',
    };

    return await this.elbv2.createTargetGroup(params).promise();
  }
}
