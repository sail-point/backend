'use strict'

const faker = require('faker')
const storeMock = require('./store-mock.js')
const Employee = require('../../model/employee.js')

let create = () => {
  let result = {}
  return storeMock.create('12345')
    .then(tempStore => {
      result.tempStore = tempStore
      return new Employee({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        title: faker.lorem.words(5),
        email: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        hoursPerWeek: Math.floor(Math.random() * 100),
        salaryPerHour: Math.floor(Math.random() * 250),
        pin: Math.random().toString().slice(-4),
        hired: faker.date.past(),
        terminated: null,
        store: result.tempStore.store._id,
      }).save()
    })
    .then(employee => {
      result.employee = employee
      return result
    })
}

let createMany = (num) => {
  return Promise.all(new Array(num).fill(0).map(() => create()))
}

let remove = () => {
  return Promise.all([
    storeMock.remove(),
    Employee.remove({}),
  ])
}

module.exports = { create, createMany, remove }
