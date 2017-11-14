'use strict'

require('./lib/setup.js')

const faker = require('faker')
const superagent = require('superagent')
const server = require('../lib/server.js')
const storeMock = require('./lib/store-mock.js')
const employeeMock = require('./lib/employee-mock.js')

const apiURL = `http://localhost:${process.env.PORT}`

describe('/employees', () => {
  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(employeeMock.remove)

  describe('POST /employees', () => {
    test('200 should return an employee', () => {
      let tempStore
      return storeMock.create('12345')
        .then(mock => {
          tempStore = mock
          return superagent.post(`${apiURL}/employees`)
            .set('Authorization', `Bearer ${tempStore.token}`)
            .send({
              firstName: 'Usagi',
              lastName: 'Tsukino',
              title: 'Server',
              email: 'usagi@crystal.net',
              phoneNumber: '206-345-5353',
              hoursPerWeek: 30,
              salaryPerHour: 20,
              pin:'35354',
              hired: '2017-11-13T23:16:34.000Z',
              terminated: null,
            })
        })
        .then(response => {
          expect(response.body.firstName).toEqual('Usagi')
          expect(response.body.lastName).toEqual('Tsukino')
          expect(response.body.title).toEqual('Server')
          expect(response.body.email).toEqual('usagi@crystal.net')
          expect(response.body.phoneNumber).toEqual('206-345-5353')
          expect(response.body.hoursPerWeek).toEqual(30)
          expect(response.body.salaryPerHour).toEqual(20)
          expect(response.body.pin).toEqual('35354')
          expect(response.body.hired).toEqual('2017-11-13T23:16:34.000Z')
          expect(response.body.terminated).toEqual(null)
          expect(response.body.store).toEqual(tempStore.store._id.toString())
          expect(response.status).toEqual(200)
        })
    })

    test('400 should return bad request', () => {
      let tempStore
      return storeMock.create('12345')
        .then(mock => {
          tempStore = mock
          return superagent.post(`${apiURL}/employees`)
            .set('Authorization', `Bearer ${tempStore.token}`)
            .send({
              firstName: 'Usagi',
              title: 'Server',
              email: 'usagi@crystal.net',
              phoneNumber: '206-345-5353',
              hoursPerWeek: 30,
              salaryPerHour: 20,
              pin:'3535',
              hired: '2017-11-13T23:16:34.000Z',
              terminated: null,
            })
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400)
        })
    })

    test('404 Employee not found', () => {
      let tempStore
      return storeMock.create('1233')
        .then(mock => {
          tempStore = mock
          return superagent.post(`${apiURL}/badEmployee`)
            .set('Authorization', `Bearer ${tempStore.token}`)
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404)
        })
    })

    test('401 should return unauthorized', () => {
      return superagent.post(`${apiURL}/employees`)
        .set('Authorization', `Bad Token`)
        .send({
          firstName: 'Michiru',
          lastName: 'Kaioh',
          title: 'Manager',
          email: 'michiru@crystal.net',
          phoneNumber: '206-346-5353',
          hoursPerWeek: 40,
          salaryPerHour: 20,
          pin:'3535',
          hired: '2017-10-13T23:16:34.000Z',
          terminated: null,
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(401)
        })
    })
  })

  describe('GET /employees', () => {
    test('GET /employees/pin/:pin 200 should return employee whose pin is entered', () => {
      let tempMock
      return employeeMock.create()
        .then(mock => {
          tempMock = mock
          return superagent.get(`${apiURL}/employees/pin/${mock.employee.pin}`)
            .set('Authorization', `Bearer ${mock.tempStore.token}`)
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.body.firstName).toEqual(tempMock.employee.firstName)
          expect(res.body.lastName).toEqual(tempMock.employee.lastName)
          expect(res.body.pin).toEqual(tempMock.employee.pin)
        })
    })

    test('GET /employees 200 should return 10 employees', () => {
      let tempStore
      let mockPassword = faker.internet.password()
      return storeMock.create(mockPassword)
        .then(mock => {
          tempStore = mock
          return employeeMock.createMany(10)
            .then(() => {
              return superagent.get(`${apiURL}/employees`)
                .set('Authorization', `Bearer ${tempStore.token}`)
            })
            .then(res => {
              expect(res.status).toEqual(200)
              expect(res.body.count).toEqual(10)
              expect(res.body.data.length).toEqual(10)
            })
        })
    })

    test('GET /employees? 200 should return 10 employees', () => {
      let tempStore
      let mockPassword = faker.internet.password()
      return storeMock.create(mockPassword)
        .then(mock => {
          tempStore = mock
          return employeeMock.createMany(10)
            .then(() => {
              return superagent.get(`${apiURL}/employees?title=Server`)
                .set('Authorization', `Bearer ${tempStore.token}`)
            })
            .then(res => {
              expect(res.status).toEqual(200)
            })
        })
    })

    test('GET /employees? 200 should return 10 employees (fuzzy)', () => {
      let tempStore
      let mockPassword = faker.internet.password()
      return storeMock.create(mockPassword)
        .then(mock => {
          tempStore = mock
          return employeeMock.createMany(10)
            .then(() => {
              return superagent.get(`${apiURL}/employees?title=ser`)
                .set('Authorization', `Bearer ${tempStore.token}`)
            })
            .then(res => {
              expect(res.status).toEqual(200)
            })
        })
    })

    test('GET /employees 200 page should be NaN', () => {
      let token
      return employeeMock.create()
        .then(mock => {
          token = mock.tempStore.token
          return superagent.get(`${apiURL}/employees?page=wedrfgh`)
            .set('Authorization', `Bearer ${token}`)
        })
        .then(res => {
          expect(res.status).toEqual(200)
        })
    })

    test('GET /employees 200 page should be less than zero', () => {
      let token
      return employeeMock.create()
        .then(mock => {
          token = mock.tempStore.token
          return superagent.get(`${apiURL}/employees?page=-1`)
            .set('Authorization', `Bearer ${token}`)
        })
        .then(res => {
          expect(res.status).toEqual(200)
        })
    })

    test('200 page should be less than zero', () => {
      let token
      return employeeMock.create()
        .then(mock => {
          token = mock.tempStore.token
          return superagent.get(`${apiURL}/employees?page=1`)
            .set('Authorization', `Bearer ${token}`)
        })
        .then(res => {
          expect(res.status).toEqual(200)
        })
    })
  })

  describe('PUT /employees/:id', () => {
    test('PUT /employees/:id 200', () => {
      let tempEmployee
      return employeeMock.create()
        .then(mock => {
          tempEmployee = mock
          return superagent.put(`${apiURL}/employees/${tempEmployee.employee._id}`)
            .set('Authorization', `Bearer ${tempEmployee.tempStore.token}`)
            .send({
              firstName: 'Haruka',
              lastName: 'Tenoh',
            })
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.body.firstName).toEqual('Haruka')
          expect(res.body.lastName).toEqual('Tenoh')
        })
    })

    test('PUT /employees/:id 404', () => {
      return employeeMock.create()
        .then(mock => {
          return superagent.put(`${apiURL}/employees/badId`)
            .set('Authorization', `Bearer ${mock.tempStore.token}`)
            .send({
              firstName: 'Setsuna',
              lastName: 'Meioh',
            })
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404)
        })
    })
  })

  describe('DELETE /employees/:id', () => {
    test('should respond with a 204', () => {
      let tempEmployee
      return employeeMock.create()
        .then(mock => {
          tempEmployee = mock
          return superagent.delete(`${apiURL}/employees/${tempEmployee.employee._id}`)
            .set('Authorization', `Bearer ${tempEmployee.tempStore.token}`)
        })
        .then(res => {
          expect(res.status).toEqual(204)
        })
    })
  })
})
