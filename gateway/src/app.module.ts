import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApiService } from './api/api.service';
import { ConfigModule } from '@nestjs/config';
import { LoyaltyThirdService } from "./third/loyalty.third.service";
import { ReservationThirdService } from "./third/reservation.third.service";
import { ApiController } from "./api/api.controller";
import { PaymentThirdService } from "./third/payment.third.service";
import { PersonThirdService } from "./third/person.third.service";
import { AppService } from "./app.service";


@Module({
    imports: [ConfigModule.forRoot({ envFilePath: '.env' })],
    controllers: [AppController, ApiController],
    providers: [
        ApiService,
        AppService,
        LoyaltyThirdService,
        PaymentThirdService,
        PersonThirdService,
        ReservationThirdService,
    ],
})
export class AppModule {
}
