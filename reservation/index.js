const express = require('express');
const pool = require('./pool');
const { HotelDba } = require("./Dba");
const e = require("express");
const { raw } = require("express");

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.send('Index'));

const dba = new HotelDba(pool);
dba.initTables();

app.get('/hotels', async (req, res) => {
    const page = Math.max(1, +req.query.page || 0) - 1;
    const limit = Math.min(1000, Math.max(1, +req.query.limit || 0));
    res.json(await dba.findHotels(page, limit));
});

app.get('/hotel/:uid', async (req, res) => {
    const hotel = (await dba.findHotelsByUids([req.params.uid]))[0];
    if(!hotel) return res.status(404).end();
    res.json(hotel).end();
});

app.get('/reservations', async (req, res) => {
    const reservations = await dba.findReservations(JSON.parse(req.query.s || '{}'));

    const hotels = new Map();
    reservations.forEach(e => hotels.set(e.hotelUid, null));

    (await dba.findHotelsByUids(Array.from(hotels.keys()))).forEach(e => hotels.set(e.hotelUid, e));
    reservations.forEach(e => e.hotel = hotels.get(e.hotelUid));

    res.json(reservations);
});

app.post('/reservation', async (req, res) => {
    const body = req.body;
    const userName = body.userName;
    const hotelUid = body.hotelUid;
    const paymentUid = body.paymentUid;
    const startDate = body.startDate;
    const endDate = body.endDate;

    const hotel = await dba.findHotelsByUids(hotelUid);
    if (!hotel) return res.status(404).end();

    const uid = await dba.addReservation(userName, paymentUid, hotel.id, startDate, endDate);
    const ret = (await dba.findReservations({ uid }))[0];
    if (!ret) return res.status(500);
    res.json(ret).end();
});


app.delete('/reservation/:uid', async (req, res) => {
    const uid = req.params.uid;
    if(!uid) return res.status(400).end();
    await dba.cancelReservation(uid);
    res.status(200).end();
});


const port = process.env.APP_PORT;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});