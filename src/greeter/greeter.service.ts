import { Injectable } from '@nestjs/common';

@Injectable()
export class GreeterService {
  sayHello({ name }: { name: string }): { message: string } {
    return { message: `Hello, ${name}! 👋` };
  }
}
