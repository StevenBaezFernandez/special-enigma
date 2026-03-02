import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getData: vi.fn().mockReturnValue({ status: 'ok' }),
          },
        },
      ],
    }).compile();
  });

  describe('getData', () => {
    it('should return an operational status payload', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual(
        expect.objectContaining({
          status: 'ok',
        }),
      );
    });
  });
});
