'use strict'

// Load mock environment
require('./lib/setup.js')

const superagent = require('superagent')
const server = require('../lib/server.js')
const storeMock = require('./lib/store-mock.js')

const apiURL = `http://localhost:${process.env.PORT}`

describe('AUTH router', () => {
  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(storeMock.remove)

  describe('/admin/signup', () => {
    test('POST /admin/signup with 200', () => {
      return superagent.post(`${apiURL}/admin/signup`)
        .send({
          storeName: 'ChunkyCheese',
          email: 'TheChunks@yahoo.com',
          address: '1234 cool beans rd',
          phone: '111-222-3333',
          website: 'chunkycheese.com',
          password: '1234password',
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.body.token).toBeTruthy()
        })
    })

    test('POST /admin/signup with 400 (missing email)', () => {
      return superagent.post(`${apiURL}/admin/signup`)
        .send({
          storeName: 'ChunkyCheese',
          address: '1234 cool beans rd',
          phone: '111-222-3333',
          website: 'chunkycheese.com',
          password: '1234password',
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(400)
        })
    })

    test('POST /admin/signup with 409 (duplicate)', () => {
      return superagent.post(`${apiURL}/admin/signup`)
        .send({
          storeName: 'ChunkyCheese',
          email: 'TheChunks@yahoo.com',
          address: '1234 cool beans rd',
          phone: '111-222-3333',
          website: 'chunkycheese.com',
          password: '1234password',
        })
        .then(() => {
          // Same username signing up
          return superagent.post(`${apiURL}/admin/signup`)
            .send({
              storeName: 'ChunkyCheese',
              email: 'TheChunks@yahoo.com',
              address: '1234 cool beans rd',
              phone: '111-222-3333',
              website: 'chunkycheese.com',
              password: '1234password',
            })
        })
        .then(Promise.reject)
        .catch(res => {
          expect(res.status).toEqual(409)
        })
    })

    test('GET /admin/login with 200',() => {
      return storeMock.create()
        .then(mock => {
          return superagent.get(`${apiURL}/admin/login`)
            .auth(mock.request.storeName, mock.request.password)
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.body.token).toBeTruthy()
        })
    })
  })
})
