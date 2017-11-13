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

  describe('/auth', () => {
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

    test('GET /admin/login with 200',() => {
      return storeMock.create()
        .then(mock => {
          console.log('STORENAME', mock.request.storeName)
          console.log('PASSWORD', mock.request.password)
          console.log('REQUEST', mock.request)
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
