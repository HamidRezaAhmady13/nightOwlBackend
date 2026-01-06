import { GreeterService } from './greeter.service';
export declare class GreeterController {
    private readonly greeterService;
    constructor(greeterService: GreeterService);
    sayHello(data: {
        name: string;
    }): {
        message: string;
    };
}
