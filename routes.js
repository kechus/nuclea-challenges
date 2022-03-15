import { Router } from "express";
import { validateInputs } from "./middleware.js";
import { alpha, flatten } from "./part_one.js";
import { fetchQuote, fetchQuotes } from "./part_two.js";

const router = Router()

router.put('/alpha', validateInputs, alpha)

router.post('/flatten', validateInputs, flatten)

router.post('/quote', fetchQuote)

router.get('/quotes', fetchQuotes)

export { router }