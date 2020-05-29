export class CreateTaskDto {
  name: string; // name:rivision
  image: string;
  tag: string;
  containerPort: number;
  hostPort: number;
}

export class CreateServiceDto {
  name: string;
  cluster: string;
  desiredCount: number;
  taskDefinition: string;
  port: string;
  capacityProvider: string;
}

export class UpdateServiceStateDto {
  desiredCount: number;
  service: string;
  cluster: string;
}

export class DeleteServiceDto {
  service: string;
  cluster: string;
}
