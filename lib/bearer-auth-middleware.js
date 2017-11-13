'use strict'

const jwt = require('jsonwebtoken')
const httpErrors = require('http-errors')
const Store = require('../model/store.js')
const promisify = require('./promisify.js')

module.exports = (req, res, next) => {
  if(!req.headers.authorization)
    return next(httpErrors(400, '__REQUEST_ERROR__ authorization header required'))

  const token = req.headers.authorization.split('Bearer ')[1]
  if(!token)
    return next(httpErrors(401, '__REQUEST_ERROR__ unauthorized'))

  promisify(jwt.verify)(token, process.env.SECRET)
    .catch(err => Promise.reject(httpErrors(401, err)))
    .then(decrypted => {
      return Store.findOne({tokenSeed: decrypted.tokenSeed})
    })
    .then(store => {
      req.store = store
      next()
    })
    .catch(next)
}
