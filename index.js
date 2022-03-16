import express from "express";
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from "./middleware.js";
import { config } from "dotenv";
import { router } from './routes.js'

config()
initializeApp({
  credential: cert(
    JSON.parse(Buffer.from(process.env.GOOGLE_CONFIG_BASE64, 'base64').toString('ascii'))
  )
})
const db = getFirestore()
const app = express()
app.use(express.json());
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})
app.use(logger)
app.use(router)


export { app, db }