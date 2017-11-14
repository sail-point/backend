'use strict'

require('./lib/setup.js')

const faker = require('faker')
const superagent = require('superagent')
const server = require('../lib/server.js')
const storeMock = require('./lib/store-mock.js')
const productMock = require('./lib/product-mock.js')

const apiURL = `http://localhost:${process.env.PORT}`

describe('/products', () => {
  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(storeMock.remove)
  afterEach(productMock.remove)

  describe('POST /product', () => {
    test('200 OK, should create a product', () => {
      let tempStore
      return storeMock.create()
        .then(mock => {
          tempStore = mock
          return superagent.post(`${apiURL}/products`)
            .set('Authorization', `Bearer ${tempStore.token}`)
            .send({
              name: 'carrots',
              category: 'health',
              price: 6,
              image: faker.image.food,
              vegan: true,
              vegetarian: true,
              glutenFree: true,
              available: true,
              store: tempStore.store._id,
            })
        })
        .then(res => {
          console.log(res.body)
          expect(res.status).toEqual(200)
          expect(res.body.name).toEqual('carrots')
          expect(res.body.category).toEqual('health')
          expect(res.body.price).toEqual(6)
          expect(res.body.vegan).toEqual(true)
          expect(res.body.vegetarian).toEqual(true)
          expect(res.body.glutenFree).toEqual(true)
          expect(res.body.available).toEqual(true)
        })

    })

    test('400 Product did not receive the correct values', () => {
      let tempStore
      return storeMock.create()
        .then(mock => {
          tempStore = mock
          return superagent.post(`${apiURL}/products`)
            .set('Authorization', `Bearer ${tempStore.token}`)

        })
        .then(Promise.reject)
        .catch(res => {
          console.log(res.body)
          expect(res.status).toEqual(400)
        })

    })

    test('401 OK, should create a product', () => {
      let tempStore
      return storeMock.create()
        .then(mock => {
          tempStore = mock
          return superagent.post(`${apiURL}/products`)
            .set('Authorization', `Bearer ${tempStore.token}`)
            // .send({
            // })
        })
        .then(Promise.reject)
        .catch(res => {
          console.log(res.body)
          expect(res.status).toEqual(401)
        })

    })
  })
})