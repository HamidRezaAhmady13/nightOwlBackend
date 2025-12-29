import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private configService;
    private userService;
    private authService;
    constructor(configService: ConfigService, userService: UserService, authService: AuthService);
    validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any>;
}
export {};
