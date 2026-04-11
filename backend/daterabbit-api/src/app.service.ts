import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getVersion() {
    return {
      version: '1.0.0',
      commit: process.env.COMMIT_SHA || null,
    };
  }
}
