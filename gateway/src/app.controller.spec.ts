import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ApiService } from './api/api.service';
import { LoyaltyThirdService } from "./third/loyalty.third.service";
import { PaymentThirdService } from "./third/payment.third.service";
import { PersonThirdService } from "./third/person.third.service";
import { ReservationThirdService } from "./third/reservation.third.service";

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({ controllers: [AppController] }).compile();
        appController = app.get(AppController);
    });

    it('should return "OK"', () => {
        expect(appController.checkHealth()).toBe('OK');
    });
});
