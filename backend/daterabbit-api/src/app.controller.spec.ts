import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('version', () => {
    it('should return version with version "1.0.0"', () => {
      const result = appController.getVersion();
      expect(result.version).toBe('1.0.0');
    });

    it('should return commit as null when COMMIT_SHA is not set', () => {
      delete process.env.COMMIT_SHA;
      const result = appController.getVersion();
      expect(result.commit).toBeNull();
    });

    it('should return commit from COMMIT_SHA env var when set', () => {
      process.env.COMMIT_SHA = 'abc123';
      const result = appController.getVersion();
      expect(result.commit).toBe('abc123');
      delete process.env.COMMIT_SHA;
    });
  });
});
