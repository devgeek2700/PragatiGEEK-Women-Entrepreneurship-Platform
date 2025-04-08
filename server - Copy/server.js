import app from "./app.js";
import { connectDb } from './database/db.js'
import { v2 as cloudinary } from 'cloudinary';
import Stripe from 'stripe';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.listen(process.env.PORT, () => {
    connectDb()
    console.log(`server is running on http://localhost:${process.env.PORT}`);
})