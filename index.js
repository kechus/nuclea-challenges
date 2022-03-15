import express from "express";
import axios from "axios";
import fs from 'fs'

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

const QUOTE_API_PATH = 'https://programming-quotes-api.herokuapp.com/quotes/random'
const app = express()
app.use(express.json());
app.listen(4000)
app.use(logger)

app.put('/alpha', validateInputs, (req, res) => {
  const payload = req.body
  const orderedKeys = Object.keys(payload).sort()
  const orderedPayload = {}
  for (const key of orderedKeys) {
    orderedPayload[key] = payload[key]
  }
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
  res.status(201).json(quoteWithDate)
})

app.get('/quotes', async (req, res) => {
  const quote = await fetch(process.env.DATABASE_PATH)
})

app.post('/test', (req, res) => {
  console.log('yahalo')
  res.status(200).send()
})

