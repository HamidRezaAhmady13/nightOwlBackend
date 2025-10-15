import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
    theres for now 
    /auth , 
    /comment ,
    /post ,
    /user ,
    /notification
    `;
  }
}
