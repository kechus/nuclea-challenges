import express from "express";
import axios from "axios";
import fs from 'fs'
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from "dotenv";

// const firebaseConfig = {
//   apiKey: "AIzaSyDO-8KjFXfE7cAE9L7DPcERzjAhECrXIXQ",
//   authDomain: "nuclea-interview.firebaseapp.com",
//   projectId: "nuclea-interview",
//   storageBucket: "nuclea-interview.appspot.com",
//   messagingSenderId: "533469697152",
//   appId: "1:533469697152:web:88d8a1a87f775a6ad98265"
// };

const validateInputs = (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send()
  }
  next()
}

const logger = (req, res, next) => {
  const current_datetime = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
  const method = req.method;
  const url = req.url;
  const status = res.statusCode;
  const log = `[${current_datetime}] ${method}:${url} ${status} `;
  console.log(log);
  writeInLog(log)
  next();
};

const writeInLog = (log) => {
  fs.appendFile('logs.txt', log + '\n', err => {
    if (err) {
      console.log(err)
    }
  })
}

config()
const QUOTE_API_PATH = 'https://programming-quotes-api.herokuapp.com/quotes/random'
const app = express()
initializeApp({
  credential: cert(
    JSON.parse(Buffer.from(process.env.GOOGLE_CONFIG_BASE64, 'base64').toString('ascii'))
  )
})
const db = getFirestore()
app.use(express.json());
app.listen(4000)
app.use(logger)

app.put('/alpha', validateInputs, async (req, res) => {
  const payload = req.body
  const orderedKeys = Object.keys(payload).sort()
  const orderedPayload = {}
  for (const key of orderedKeys) {
    orderedPayload[key] = payload[key]
  }
  const docRef = db.collection('alphas').doc(new Date().toISOString());
  await docRef.set(orderedPayload);
  res.status(201).json(orderedPayload)
})

app.post('/flatten', validateInputs, (req, res) => {
  const payload = req.body
  const arrayFreePayload = {}
  for (const [key, value] of Object.entries(payload)) {
    if (value instanceof Array) {
      arrayFreePayload[key] = value.join(",")
    } else {
      arrayFreePayload[key] = value
    }
  }
  res.status(200).json(arrayFreePayload)
})

app.post('/quote', async (req, res) => {
  const quote_res = await axios.get(QUOTE_API_PATH)
  if (quote_res.status !== 200) {
    return res.status(500).send()
  }
  const quote = quote_res.data
  const quoteWithDate = {
    author: quote.author,
    id: quote.id,
    quote: quote.en,
    consultation_date: new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })
  }
  addQuoteToDB({ ...quoteWithDate })
  res.status(201).json(quoteWithDate)
})

const addQuoteToDB = async (quoteToAdd) => {
  const docRef = db.collection('authors').doc(quoteToAdd.author)
  delete quoteToAdd["author"]
  const author = await docRef.get()
  if (author.exists) {
    const quotes = author.data().quotes
    for (const existingQuote of quotes) {
      if (existingQuote.id == quoteToAdd.id) {
        return
      }
    }
    quotes.push(quoteToAdd)
    await docRef.set({
      "quotes": quotes
    })
  } else {
    await docRef.set({
      "quotes": [quoteToAdd]
    })
  }
}

app.get('/quotes', async (req, res) => {
  const snapshot = await db.collection('authors').get();
  const value = {}
  snapshot.forEach((doc) => {
    value[doc.id] = doc.data().quotes.sort((a, b) =>
      (a.consultation_date < b.consultation_date) ? 1 : -1)
  });
  res.status(200).json(value)
})

app.post('/test', (req, res) => {
  console.log('yahalo')
  res.status(200).send()
})

