import { Injectable } from "@nestjs/common";
import { PaymentInfo } from "../api/dto";
import { localBinExists } from "@nestjs/cli/lib/utils/local-binaries";


@Injectable()
export class PaymentThirdService {
    private readonly url: string;

    constructor() {
        this.url = process.env.PAYMENT_URL;
    }

    private mapPayment(e): PaymentInfo {
        return { paymentUid: e.uid, status: e.status, price: e.price };
    }


    async addPayment(price: number) {
        let res = await fetch(`${this.url}/payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ price }),
        });
        if (res.status !== 200) return null;

        const uid = (await res.json()).uid;

        res = await fetch(`${this.url}/payment/${uid}`);
        if (res.status !== 200) return null;

        return this.mapPayment(await res.json());
    }

    async getPayments(uids: string[]): Promise<PaymentInfo[]> {
        const res = await fetch(`${this.url}/payments?uids=${JSON.stringify(uids)}`);
        if (res.status !== 200) return null;
        return (await res.json()).map(e => this.mapPayment(e));
    }

    async cancelPayment(uid: string) {
        const res = await fetch(`${this.url}/payment/${uid}`, { method: 'DELETE' });
        return res.status === 200;
    }
}