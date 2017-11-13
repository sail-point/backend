'use strict'

require('dotenv').config()

const cors = require('cors')
const morgan = require('morgan')
const express = require('express')
const mongoose = require('mongoose')
const jsonParser = require('body-parser').json()
const authRouter = require('../route/auth-router.js')

// Enable promises
mongoose.Promise = Promise

const app = express()
let server = null
const production = process.env.NODE_ENV === 'production'

// Register middleware
app.use(jsonParser)
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(morgan(production ? 'combined' : 'dev'))

// Register routes
app.use(authRouter)

// Register 404 route
app.all('*', (req, res) => res.sendStatus(404))

// Register error handler
app.use(require('./error-middleware.js'))

module.exports = {
  start: () => {
    return new Promise((resolve, reject) => {
      if (server)
        return reject(new Error('__SERVER_ERROR__ server is already on'))
      server = app.listen(process.env.PORT, () => {
        console.log('__SERVER_ON__', process.env.PORT)
        return resolve()
      })
    })
      .then(() => mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true }))
  },
  stop: () => {
    return new Promise((resolve, reject) => {
      if (!server)
        return reject(new Error('__SERVER_ERROR__ server is already off'))
      server.close(() => {
        server = null
        console.log('__SERVER_OFF__')
        return resolve()
      })
    })
      .then(() => mongoose.disconnect())
  },
}
