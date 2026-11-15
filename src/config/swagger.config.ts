import { registerAs } from '@nestjs/config';

export interface SwaggerConfig {
  url: string;
  username?: string;
  password?: string;
  token?: string;
}

export const swaggerConfig = registerAs(
  'swagger',
  (): SwaggerConfig => ({
    url: process.env.SWAGGER_URL ?? '',
    username: process.env.SWAGGER_USERNAME,
    password: process.env.SWAGGER_PASSWORD,
    token: process.env.SWAGGER_TOKEN,
  }),
);
