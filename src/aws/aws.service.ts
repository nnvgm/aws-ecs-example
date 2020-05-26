import { Injectable } from '@nestjs/common';
import { ECS } from 'aws-sdk';

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

  createTask(createTaskDto: CreateTaskDto) {
    const { name, image, tag, containerPort, hostPort } = createTaskDto;
    const params: ECS.RegisterTaskDefinitionRequest = {
      containerDefinitions: [
        {
          name,
          cpu: 256,
          environment: [
            {
              name: 'STRING_VALUE',
              value: 'STRING_VALUE',
            },
          ],
          essential: true,
          image: `${image}:${tag}`,
          memory: 1024,
          portMappings: [
            {
              containerPort,
              hostPort,
              protocol: 'tcp',
            },
          ],
        },
      ],
      family: name,
      cpu: '256',
      executionRoleArn: 'arn:aws:iam::256295095336:role/ecsTaskExecutionRole',
      memory: '1024',
      networkMode: 'awsvpc',
      requiresCompatibilities: ['EC2'],
      taskRoleArn: 'arn:aws:iam::256295095336:role/ecsTaskExecutionRole',
    };

    return new Promise((resolve, reject) => {
      this.ecs.registerTaskDefinition(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          // 1. site =>
          resolve(data);
        }
      });
    });
  }

  createService(createServiceDto: CreateServiceDto) {
    const {
      serviceName,
      cluster,
      desiredCount,
      taskDefinition,
    } = createServiceDto;

    const params: ECS.CreateServiceRequest = {
      capacityProviderStrategy: [
        {
          capacityProvider: 'RECRUIT_T2_MICRO',
          weight: 1,
        },
      ],
      serviceName, // domain_name
      cluster, // constant
      desiredCount, // 1 || 0
      placementStrategy: [
        {
          type: 'binpack',
        },
      ],
      healthCheckGracePeriodSeconds: 60,
      taskDefinition: taskDefinition,
      loadBalancers: [
        {
          // targetGroupArn: 'ecs-tm3-ec',
          containerName: 'tm3-dev-api',
          containerPort: 7000,
          loadBalancerName: 'toremasse3-dev', // hard
        },
      ],
      // role: 'AWSServiceRoleForECS',
      // networkConfiguration: {
      //   awsvpcConfiguration: {
      //     subnets: [
      //       /* required */
      //       'subnet-2a6db901',
      //       'subnet-6f9c5027',
      //       'subnet-5079470b',
      //       /* more items */
      //     ],
      //     assignPublicIp: 'DISABLED',
      //     securityGroups: [
      //       'sg-0decd463c16862528',
      //       /* more items */
      //     ],
      //   },
      // },
    };

    return new Promise((resolve, reject) => {
      this.ecs.createService(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  updateServiceState(updateServiceDto: UpdateServiceStateDto) {
    const { desiredCount, service, cluster } = updateServiceDto;

    const params: ECS.UpdateServiceRequest = {
      desiredCount,
      service,
      cluster,
    };

    return new Promise((resolve, reject) => {
      this.ecs.updateService(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  deleteService(deleteServiceDto: DeleteServiceDto) {
    const { service, cluster } = deleteServiceDto;

    const params: ECS.DeleteServiceRequest = {
      service,
      cluster,
      force: true,
    };

    return new Promise((resolve, reject) => {
      this.ecs.deleteService(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
