import { Injectable } from '@nestjs/common';
import { HotelInfo, Pagination, ReservationInfo } from "../api/dto";

@Injectable()
export class ReservationThirdService {
    private readonly url: string;

    constructor() {
        this.url = process.env.RESERVATION_URL;
    }

    async getHotels(page: number, size: number): Promise<Pagination<HotelInfo>> {
        page ||= 1;
        size ||= 20;
        console.log(`${this.url}/hotels?page=${page}&size=${size}`);
        const resp = await fetch(`${this.url}/hotels?page=${page}&size=${size}`);
        if (resp.status !== 200) return null;

        const json = await resp.json();

        return {
            items: json.items,
            totalElements: json.totalElements,
            pageSize: size,
            page
        }
    }

    async getHotel(uid: string): Promise<HotelInfo> {
        const resp = await fetch(`${this.url}/hotel/${uid}`);
        if (resp.status !== 200) return null;
        return await resp.json();
    }

    async getReservations(options: { userName?: string, uid?: string }): Promise<ReservationInfo[]> {
        const resp = await fetch(`${this.url}/reservations?${JSON.stringify(options)}`);
        if (resp.status !== 200) return null;
        return await resp.json();
    }

    async addReservation(reservation: {
        userName: string,
        hotelUid: string,
        paymentUid: string,
        startDate: string,
        endDate: string
    }): Promise<ReservationInfo> {
        const resp = await fetch(`${this.url}/reservation`, {
            method: 'POST',
            headers: { 'Content-type': 'application/json; charset=utf-8' },
            body: JSON.stringify(reservation),
        });

        if (resp.status !== 200) return null;
        return await resp.json();
    }

    async cancelReservation(uid: string) {
        const resp = await fetch(`${this.url}/reservation/${uid}`, { method: 'DELETE' });
        return resp.status === 200;
    }
}
