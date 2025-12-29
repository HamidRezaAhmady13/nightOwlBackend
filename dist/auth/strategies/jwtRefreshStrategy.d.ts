import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private readonly config;
    constructor(config: ConfigService);
    validate(payload: any): Promise<{
        id: string;
    }>;
}
export {};
