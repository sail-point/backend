'use strict'

const {Router} = require('express')
const httpErrors = require('http-errors')
const bearerAuth = require('../lib/bearer-auth-middleware.js')
const Order = require('../model/order.js')

let fuzzy = (filterTerm) => new RegExp('.*' + filterTerm.toLowerCase().split('').join('.*') + '.*')

module.exports = new Router()
  .post('/orders', bearerAuth, (req, res, next) => {
    return new Order({
      ...req.body, // products and employee from fronted
    }).save()
      .then(offer => {
        res.json(offer)
      })
      .catch(next)
  })
  .put('/orders/:id', bearerAuth, (req, res, next) => {
    if (!req.body.employee || !req.body.products)
      return next(httpErrors(400, 'employee and products required'))
    Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('products')
      .populate('employee')
      .then(order => {
        if (!order)
          throw httpErrors(404, '__REQUEST_ERROR__ order not found')
        res.json(order)
      })
      .catch(next)
  })
  .get('/orders/:id', bearerAuth, (req, res, next) => {
    Order.findById(req.params.id)
      .populate('products')
      .populate('employee')
      .then(order => {
        if (!order)
          throw httpErrors(404, '__REQUEST_ERROR__ order not found')
        res.json(order)
      })
      .catch(next)
  })
  .get('/orders', bearerAuth, (req, res, next) => {
    let {page = '0'} = req.query
    delete req.query.page
    page = Number(page)
    if (isNaN(page))
      page = 0
    page = page < 0 ? 0 : page

    // Fuzzy Search
    if (req.query.employee) req.query.employee = ({$regex: fuzzy(req.query.employee), $options: 'i'})
    if (req.query.products) req.query.products = ({$regex: fuzzy(req.query.products), $options: 'i'})
    if (req.query.id) req.query.id = ({$regex: fuzzy(req.query.id), $options: 'i'})

    let ordersCache

    Order.find(req.query)
      .populate('products')
      .populate('employee')
      .skip(page * 100)
      .limit(100)
      .then(orders => {
        ordersCache = orders
        return Order.find(req.query).count()
      })
      .then(count => {
        let result = {
          count,
          data: ordersCache,
        }

        let lastPage = Math.floor(count / 100)

        res.links({
          next: `http://localhost/orders?page=${page + 1}`,
          prev: `http://localhost/orders?page=${page < 1 ? 0 : page - 1}`,
          last: `http://localhost/orders?page=${lastPage}`,
        })
        res.json(result)
      })
      .catch(next)
  })
