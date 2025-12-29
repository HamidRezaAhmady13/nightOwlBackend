import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AuthenticatedRequest } from 'src/common/interfaces/user-request.interface';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private cookieOptions;
    create(avatar: Express.Multer.File, createUserDto: CreateUserDto, res: Response): Promise<{
        access_token: string;
    }>;
    signIn({ email, password }: {
        email: string;
        password: string;
    }, res: Response): Promise<{
        access_token: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        access_token: string;
        refreshJti: string;
    }>;
    logout(res: Response): {
        message: string;
    };
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: AuthenticatedRequest, res: Response): Promise<void>;
}
