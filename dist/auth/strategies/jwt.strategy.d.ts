import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { RevocationService } from 'src/auth/revocation.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly revocation;
    private readonly config;
    constructor(revocation: RevocationService, config: ConfigService);
    validate(payload: any): Promise<{
        id: string;
    }>;
}
export {};
