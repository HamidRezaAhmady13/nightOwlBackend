import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
    only these main subroutes are availible:
    /auth , 
    /comment ,
    /post ,
    /user ,
    /notification
    `;
  }
}
