import { db } from "./index.js"

const alpha = async (req, res) => {
  const ordered = orderObjectByKeys(req.body)
  await insertOrderedObjectoToDB(ordered)
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
  const docRef = db.collection('alphas').doc(new Date().toISOString())
  await docRef.set(obj)
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