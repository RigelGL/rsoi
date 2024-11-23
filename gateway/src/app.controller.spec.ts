import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ApiService } from './api/api.service';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [ApiService],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('check health', () => {
        it('should return "OK"', () => {
            expect(appController.checkHealth()).toBe('OK');
        });
    });
});
