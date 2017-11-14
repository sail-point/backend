'use strict'

// const multer = require('multer')
const { Router } = require('express')
// const httpErrors = require('http-errors')
const Product = require('../model/product.js')
const bearerAuth = require('../lib/bearer-auth-middleware.js')

const apiURL = `${process.env.API_URL}`

let fuzzy = (filterTerm) => new RegExp('.*' + filterTerm.toLowerCase().split('').join('.*') + '.*')

module.exports = new Router()
  .post('/products', bearerAuth, (req, res, next) => {
    return new Product({ ...req.body, store: req.store._id })
      .save()
      .then(product => res.json(product))
      .catch(next)
  })

  .get('/products', bearerAuth, (req, res, next) => {

    Product.find({})
      .then(product => res.json(product))
      .catch(next)
  })









  .put('/products/:id', bearerAuth, (req, res, next) => {

  })
  .delete('/products:/id', bearerAuth, (req, res, next) => {

  })