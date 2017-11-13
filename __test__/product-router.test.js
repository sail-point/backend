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
          console.log('--> STORE', mock)
          tempStore = mock
          return superagent.post(`${apiURL}/products`)
            .set('Authorization', `Bearer ${tempStore.token}`)
            .set({
              name: 'carrots',
              category: 'health',
              price: 6,
              image: faker.image.food,
              vegan: true,
              vegetarian: true,
              glutenFree: true,
              available: true,
            })
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.body.name).toEqual('carrots')
          expect(res.body.category).toEqual('health')
          expect(res.body.price).toEqual(6)
          expect(res.body.image).toBeTruthy()
          expect(res.body.vegan).toEqual(true)
          expect(res.body.vegetarian).toEqual(true)
          expect(res.body.glutenFree).toEqual(true)
          expect(res.body.available).toEqual(true)
        })


    })
  })
})