'use strict'

const httpErrors = require('http-errors')
const Store = require('../model/store.js')

module.exports = (req, res, next) => {
  if(!req.headers.authorization)
    return next(httpErrors(400, '__REQUEST_ERROR__ authorization header required'))

  const encoded = req.headers.authorization.split('Basic ')[1]
  if(!encoded)
    return next(httpErrors(400, '__REQUEST_ERROR__ Basic auth required'))
  let decoded = new Buffer(encoded, 'base64').toString()
  let [email, password] = decoded.split(':')

  Store.findOne({email})
    .then(store => {
      if(!store)
        throw httpErrors(404, '__REQUEST_ERROR__ store does not exist')
      return store.passwordVerify(password)
    })
    .then(store => {
      req.store = store
      next()
    })
    .catch(next)
}
