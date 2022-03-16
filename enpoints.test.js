const axios = require('axios')
const ROUTE = 'http://localhost:4000/'

const orderObjectByKeys = (obj) => {
  const orderedKeys = Object.keys(obj).sort()
  const orderedObject = {}
  for (const key of orderedKeys) {
    orderedObject[key] = obj[key]
  }
  return orderedObject
}

describe('Part one routes', () => {
  const headers = {
    headers: {
      "content-type": "application/json",
    }
  }
  const body = {
    "some-numbers": [1, 2, 3, 4],
    "fruit": "apple",
    "animal": "zebra",
    "city-list": ["sunnyvale", "sanjose"],
  }

  test('Object\'s properties should be in alphabetical order', async () => {
    const expectedObject = {
      "animal": "zebra",
      "city-list": ["sunnyvale", "sanjose"],
      "fruit": "apple",
      "some-numbers": [1, 2, 3, 4],
    }

    const res = await axios.put(ROUTE + 'alpha', body, headers)
    expect(res.data).toEqual(expectedObject)
  })

  test('Object\'s properties shouldn\'t have arrays', async () => {
    const expectedObject = {
      "some-numbers": "1,2,3,4",
      "fruit": "apple",
      "animal": "zebra",
      "city-list": "sunnyvale,sanjose",
    }

    const res = await axios.post(ROUTE + 'flatten', body, headers)
    expect(res.data).toEqual(expectedObject)
  })
})


describe('Part two routes', () => {
  const headers = {
    headers: {
      "content-type": "application/json",
    }
  }

  test('receive quote', async () => {
    const expectedObjectKeys = {
      "author": "",
      "id": "",
      "quote": "",
      "consultation_date": "",
    }
    const expectedKeys = Object.keys(expectedObjectKeys)


    const res = await axios.post(ROUTE + 'quote', {}, headers)
    const responseKeys = Object.keys(res.data)
    expect(responseKeys).toEqual(expectedKeys)
  })

  test('receive all quotes ordered alphabetically', async () => {
    const res = await axios.get(ROUTE + 'quotes', {}, headers)
    const securelyOrdered = orderObjectByKeys(res.data)
    expect(res.data).toEqual(securelyOrdered)
  })
})