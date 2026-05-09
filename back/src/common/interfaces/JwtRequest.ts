export interface JwtRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}
