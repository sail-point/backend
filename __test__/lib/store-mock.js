'use strict'

const faker = require('faker')
const Store = require('../../model/store.js')

const storeMock = module.exports = {}

// Resolves -> request, store, token
storeMock.create = () => {
  let result = {
    request: {
      storeName: faker.company.companyName(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
      phone: faker.phone.phoneNumber(),
      website: faker.internet.url(),
      password: faker.internet.password(),
    },
  }

  return Store.create(result.request)
    .then(store => {
      result.store = store
      return store.tokenCreate()
    })
    .then(token => {
      result.token = token
      return Store.findById(result.store._id)
    })
    .then(store => {
      result.store = store
      return result
    })
}

storeMock.remove = () => Store.remove({})
