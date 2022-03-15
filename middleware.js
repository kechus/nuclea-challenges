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

export { validateInputs, logger }