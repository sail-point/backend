'use strict'

const faker = require('faker')
const storeMock = require('./store-mock.js')
const Product = require('../../model/product.js')

let create = () => {
  let tempStore
  return storeMock.create()
    .then(store => {
      tempStore = store
      return new Product({
        name: faker.lorem.words(3),
        category: faker.lorem.words(5),
        price: Math.ceil(Math.random() * 100),
        image: faker.image.food,
        vegan: Math.random() > .5,
        vegetarian: Math.random() > .5,
        glutenFree: Math.random() > .5,
        available: Math.random() > .5,
        store: tempStore.store._id,
      }).save()
    }).then(product => product)
}

let createMany = (num) => {
  return Promise.all(new Array(num).fill(0).map(() => create()))
}

let remove = () => {
  return Promise.all([
    storeMock.remove(),
    Product.remove({}),
  ])
}

module.exports = { create, createMany, remove }