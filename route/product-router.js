'use strict'

// const multer = require('multer')
const { Router } = require('express')
const httpErrors = require('http-errors')
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
    let { page = '0' } = req.query
    delete req.query.page
    page = Number(page)
    if (isNaN(page))
      page = 0
    page = page < 0 ? 0 : page

    // Fuzzy Search
    if (req.query.name) req.query.name = ({ $regex: fuzzy(req.query.name), $options: 'i' })
    if (req.query.category) req.query.category = ({ $regex: fuzzy(req.query.category), $options: 'i' })

    let productsCache
    Product.find(req.query)
      .skip(page * 100)
      .limit(100)
      .then(products => {
        productsCache = products
        return Product.find(req.query).count()
      })
      .then(count => {
        let result = {
          count,
          data: productsCache,
        }

        let lastPage = Math.floor(count / 100)
        res.links({
          next: `${apiURL}/products?page=${page + 1}`,
          prev: `${apiURL}/products?page=${page < 1 ? 0 : page - 1}`,
          last: `${apiURL}/products?page=${lastPage}`,
        })
        res.json(result)
      })
      .catch(next)
  })


  .put('/products/:id', bearerAuth, (req, res, next) => {
    if (!req.body.name)
      return next(httpErrors(400, 'product name is required'))
    Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .then(product => {
        if (!product)
          throw httpErrors(404, '__REQUEST_ERROR__ product not found')
        res.json(product)
      })
      .catch(next)
  })


  .delete('/products:/id', bearerAuth, (req, res, next) => {

  })