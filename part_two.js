import { db } from "./index.js"
import axios from "axios";
import { externalError } from "./middleware.js";

const QUOTE_API_PATH = 'https://programming-quotes-api.herokuapp.com/quotes/random'

class Quote {
  constructor(author, id, quote) {
    this.author = author
    this.id = id
    this.quote = quote
    this.consultation_date = new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })
  }
}

const fetchQuote = async (req, res) => {
  const quote = await fetchQuoteFromAPI()
  if (!quote)
    return res.status(500).send()

  const quoteWithDate = new Quote(quote.author, quote.id, quote.en)
  const status = await addQuoteToDB({ ...quoteWithDate })
  if (!status)
    return res.status(500).send()

  res.status(201).json(quoteWithDate)
}

const fetchQuoteFromAPI = async () => {
  const quote_res = await axios.get(QUOTE_API_PATH).catch(externalError)
  if (!quote_res)
    return false

  if (quote_res.status !== 200)
    return false

  return quote_res.data
}

const addQuoteToDB = async (quoteToAdd) => {
  const authorRef = db.collection('authors').doc(quoteToAdd.author)
  delete quoteToAdd["author"]
  const updatedQuotes = { quotes: [] }
  const author = await authorRef.get().catch(externalError)
  if (!author)
    return false

  if (author.exists) {
    const authorQuotes = author.data().quotes
    if (quoteExistsInAuthorQuotes(authorQuotes, quoteToAdd))
      return
    authorQuotes.push(quoteToAdd)
    updatedQuotes.quotes = authorQuotes
  } else {
    updatedQuotes.quotes = [quoteToAdd]
  }

  try {
    await authorRef.set(updatedQuotes)
    return true
  } catch (error) {
    externalError(error)
    return false
  }
}

const quoteExistsInAuthorQuotes = (authorQuotes, quoteToAdd) => {
  return authorQuotes.find(quote => quote.id == quoteToAdd.id)
}

const fetchQuotes = async (req, res) => {
  const authors = await db.collection('authors').get().catch(externalError)
  if (!authors)
    return res.status(500).send()
  const sortedAuthors = orderQuotesFromAuthorsByDate(authors)
  res.status(200).json(sortedAuthors)
}

const orderQuotesFromAuthorsByDate = (authors) => {
  const sorted = {}
  authors.forEach((doc) => {
    sorted[doc.id] = doc.data().quotes.
      sort((a, b) => (a.consultation_date < b.consultation_date) ? 1 : -1)
  });
  return sorted
}

export { fetchQuote, fetchQuotes }