import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GreeterService } from './greeter.service';

@Controller()
export class GreeterController {
  constructor(private readonly greeterService: GreeterService) {}

  @GrpcMethod('GreeterService', 'SayHello')
  sayHello(data: { name: string }) {
    return this.greeterService.sayHello(data);
  }
}
