'use strict'

const faker = require('faker')
const Product = require('../../model/product.js')

let create = ({ store }) => {
  return new Product({
    name: faker.lorem.words(3),
    category: faker.lorem.words(5),
    price: Math.ceil(Math.random() * 100),
    image: faker.image.food,
    available: Math.random() > .5,
    store: store.store._id,
  }).save()
}

let createMany = ({ store, num: num = 10  }) => {

  return Promise.all(new Array(num).fill(0).map(() => create({ store })))
}

let remove = () => {
  return Promise.all([
    Product.remove({}),
  ])
}

module.exports = { create, createMany, remove }
