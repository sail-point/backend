'use strict'

const {Router} = require('express')
const Store = require('../model/store.js')
const basicAuth = require('../lib/basic-auth-middleware.js')

const authRouter = module.exports = new Router()

authRouter.post('/admin/signup', (req, res, next) => {
  Store.create(req.body)
    .then(store => store.tokenCreate())
    .then(token => {
      res.cookie('X-SailPoint-Token', token, {maxAge: 604800000})
      res.json({token})
    })
    .catch(next)
})

authRouter.get('/admin/login', basicAuth, (req, res, next) => {
  req.store.tokenCreate()
    .then(token => {
      res.cookie('X-SailPoint-Token', token, {maxAge: 604800000})
      res.json({token})
    })
    .catch(next)
})
