'use strict'

require('./lib/setup.js')

const faker = require('faker')
const superagent = require('superagent')
const server = require('../lib/server.js')
const storeMock = require('./lib/store-mock.js')
const productMock = require('./lib/product-mock.js')

const apiURL = `${process.env.API_URL}`

describe('/products', () => {
  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(storeMock.remove)
  afterEach(productMock.remove)

  describe('POST /products', () => {
    test('200 OK should create a product', () => {
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

            })
        })
        .then(res => {
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

    test('400 Product didn\'t receive any values', () => {
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

    test('401 Bad token', () => {
      return storeMock.create()
        .then(() => {
          return superagent.post(`${apiURL}/products`)
            .set('Authorization', `Bearer bad token`)
        })
        .then(Promise.reject)
        .catch(res => {
          console.log(res.body)
          expect(res.status).toEqual(401)
        })

    })
  })

  describe('GET /products', () => {
    test('200 OK should return a bunch of products', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.createMany({ store: mock, num: 30 })
        })
        .then(() => {
          return superagent.get(`${apiURL}/products`)
            .set('Authorization', `Bearer ${tempMock.token}`)
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.body.count).toEqual(30)
        })
    })

    test('200 OK should return some name fuzzies', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.createMany({ store: mock, num: 30 })
        })
        .then(() => {
          return superagent.get(`${apiURL}/products`)
            .set('Authorization', `Bearer ${tempMock.token}`)
            .query({ name: 'h' })
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.body.count).toBeLessThan(30)
        })
    })

    test('200 OK should return some category fuzzies', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.createMany({ store: mock, num: 30 })
        })
        .then(() => {
          return superagent.get(`${apiURL}/products`)
            .set('Authorization', `Bearer ${tempMock.token}`)
            .query({ category: 'h' })
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.body.count).toBeLessThan(30)
        })
    })

    test('200 OK page should return NaN', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.create({ store: mock, num: 30 })
        })
        .then(() => {
          return superagent.get(`${apiURL}/products?page=hello`)
            .set('Authorization', `Bearer ${tempMock.token}`)
        })
        .then(res => {
          expect(res.status).toEqual(200)
        })
    })

    test('200 OK page should be less than 0', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.create({ store: mock, num: 30 })
        })
        .then(() => {
          return superagent.get(`${apiURL}/products?page=-1`)
            .set('Authorization', `Bearer ${tempMock.token}`)
        })
        .then(res => {
          expect(res.status).toEqual(200)
        })
    })

    test('200 OK page should be 1', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.create({ store: mock, num: 30 })
        })
        .then(() => {
          return superagent.get(`${apiURL}/products?page=1`)
            .set('Authorization', `Bearer ${tempMock.token}`)
        })
        .then(res => {
          expect(res.status).toEqual(200)
        })
    })

    test('401 Not authorized, bad token', () => {
      return storeMock.create()
        .then(mock => {

          return productMock.create({ store: mock })
        })
        .then(() => {
          return superagent.get(`${apiURL}/products`)
            .set('Authorization', `Bearer bad token`)
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(401)
        })
    })

    test('404 Product not found ', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.create({ store: mock })
        })
        .then(() => {
          return superagent.get(`${apiURL}/badpath`)
            .set('Authorization', `Bearer ${tempMock.token}`)
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(404)
        })
    })


  })

  describe('PUT /products/:id', () => {
    test('200 OK Product updated', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.create({ store: mock })
        })
        .then(product => {
          return superagent.put(`${apiURL}/products/${product._id}`)
            .set('Authorization', `Bearer ${tempMock.token}`)
            .send({
              name: 'banana',
              category: 'potassium',
            })
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.body.name).toEqual('banana')
          expect(res.body.category).toEqual('potassium')
        })
    })

    test('400 Bad Input, need to send a product name', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.create({ store: mock })
        })
        .then(product => {
          return superagent.put(`${apiURL}/products/${product._id}`)
            .set('Authorization', `Bearer ${tempMock.token}`)
            .send({
              category: 'potassium',
            })
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(400)
        })
    })

    test('400 Bad Input, need to send a name', () => {
      return storeMock.create()
        .then(mock => {
          return productMock.create({ store: mock })
        })
        .then(product => {
          return superagent.put(`${apiURL}/products/${product._id}`)
            .send({
              name: 'pineapple',
            })
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(400)
        })
    })

    test('401 Bad token set', () => {
      return storeMock.create()
        .then(mock => {
          return productMock.create({ store: mock })
        })
        .then(product => {
          return superagent.put(`${apiURL}/products/${product._id}`)
            .set('Authorization', `Bearer bad token`)
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(401)
        })
    })

    test('404 product not found', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.create({ store: mock })
        })
        .then(() => {
          return superagent.put(`${apiURL}/products/thisIsNotAThing`)
            .set('Authorization', `Bearer ${tempMock.token}`)
            .send({
              name: 'banana',
              category: 'potassium',
            })
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(404)
        })
    })
  })

  describe('DELETE /products/:id', () => {
    test('204 Product deleted', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.create({ store: mock })
        })
        .then(product => {
          return superagent.delete(`${apiURL}/products/${product._id}`)
            .set('Authorization', `Bearer ${tempMock.token}`)
        })
        .then(res => {
          expect(res.status).toEqual(204)
        })
    })

    test('400 no bearer authorization sent', () => {
      return storeMock.create()
        .then(mock => {
          return productMock.create({ store: mock })
        })
        .then(product => {
          return superagent.delete(`${apiURL}/products/${product._id}`)
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(400)
        })
    })

    test('401 bad token', () => {
      return storeMock.create()
        .then(mock => {
          return productMock.create({ store: mock })
        })
        .then(product => {
          return superagent.delete(`${apiURL}/products/${product._id}`)
            .set('Authorization', `Bearer bad token`)
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(401)
        })
    })

    test('404 Product not found', () => {
      let tempMock
      return storeMock.create()
        .then(mock => {
          tempMock = mock
          return productMock.create({ store: mock })
        })
        .then(() => {
          return superagent.delete(`${apiURL}/products/notAThing`)
            .set('Authorization', `Bearer ${tempMock.token}`)
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(404)
        })
    })
  })
})

