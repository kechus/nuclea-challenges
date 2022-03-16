import { db } from "./index.js"
import { externalError } from "./middleware.js"

const alpha = async (req, res) => {
  const ordered = orderObjectByKeys(req.body)
  const status = await insertOrderedObjectoToDB(ordered)
  if (!status)
    return res.status(500).send()
  res.status(201).json(ordered)
}

const orderObjectByKeys = (obj) => {
  const orderedKeys = Object.keys(obj).sort()
  const orderedObject = {}
  for (const key of orderedKeys) {
    orderedObject[key] = obj[key]
  }
  return orderedObject
}

const insertOrderedObjectoToDB = async (obj) => {
  try {
    const docRef = db.collection('alphas').doc(new Date().toISOString())
    await docRef.set(obj)
    return true
  } catch (error) {
    externalError(error)
    return false
  }
}

const flatten = (req, res) => {
  const result = flattenObject(req.body)
  res.status(200).json(result)
}

const flattenObject = (obj) => {
  const arrayFreeObject = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Array) {
      arrayFreeObject[key] = value.join(",")
    } else {
      arrayFreeObject[key] = value
    }
  }
  return arrayFreeObject
}

export { alpha, flatten }