'use strict'

const Order = require('../../model/order.js')

let create = (employee, product) => {
  return new Order({
    amount: Math.floor(Math.random() * 100),
    employee: employee._id,
    products: [product._id],
  }).save()
}

let createMany = (num, profile, charity) => {
  return Promise.all(new Array(num).fill(0).map(() => create(profile, charity)))
}

let remove = () => {
  return Promise.all([
    Order.remove({}),
  ])
}

module.exports = {create, createMany, remove}
