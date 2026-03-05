export interface TokenService {
  generate(payload: any): string;
  verify(token: string): any;
}