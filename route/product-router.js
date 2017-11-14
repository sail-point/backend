'use strict'

// const multer = require('multer')
const { Router } = require('express')
const httpErrors = require('http-errors')
const Product = require('../model/product.js')
const bearerAuth = require('../lib/bearer-auth-middleware.js')

module.exports = new Router()
  .post('/products', bearerAuth, (req, res, next) => {
    return new Product({
      ...req.body,
    })
      .save()
      .then(product => res.json(product))
      .catch(next)
  })