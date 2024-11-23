import { Injectable } from '@nestjs/common';
import { LoyaltyInfo } from "../api/dto";

@Injectable()
export class LoyaltyThirdService {
    private readonly url: string;

    constructor() {
        this.url = process.env.LOYALTY_URL;
    }

    async getLoyaltyForUser(userName: string): Promise<LoyaltyInfo> {
        const res = await fetch(`${this.url}/loyalty?name=${userName}`);
        if (res.status !== 200) return null;
        return await res.json();
    }

    async changeLoyaltyStatus(name: string, type: 'inc' | 'dec') {
        const res = await fetch(`${this.url}/update?name=${name}&type=${type}`, { method: 'POST' });
        return res.status === 200;
    }
}
