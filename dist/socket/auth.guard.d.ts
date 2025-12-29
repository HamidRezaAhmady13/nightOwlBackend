import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
export declare class SocketAuthGuard implements CanActivate {
    private authSvc;
    constructor(authSvc: AuthService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
