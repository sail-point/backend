'use strict'

const { Router } = require('express')
const httpErrors = require('http-errors')
const bearerAuth = require('../lib/bearer-auth-middleware.js')
const Employee = require('../model/employee.js')
const Store = require('../model/store.js')

let fuzzy = (filterTerm) => new RegExp('.*' + filterTerm.toLowerCase().split('').join('.*') + '.*')

module.exports = new Router()
  .post('/employees', bearerAuth, (req, res, next) => {
    console.log('req.body: ', req.body)
    return new Employee({
      ...req.body,
      photo: undefined,
      account: req.account._id,
      username: req.account.username,
      email: req.account.email,
    }).save()
      .then(employee => {
        res.json(employee)
      })
      .catch(next)
  })
  .get('/employees/me', bearerAuth, (req, res, next) => {
    Employee.findOne({account: req.account._id})
      .then(employee => {
        res.json(employee)
      })
      .catch(next)
  })
  .get('/employees/:id', bearerAuth, (req, res, next) => {
    Employee.findById(req.params.id)
      .then(employee => {
        if (!employee)
          throw httpErrors(404, '__REQUEST_ERROR__ employee not found')
        res.json(employee)
      })
      .catch(next)
  })
  .get('/employees', bearerAuth, (req, res, next) => {
    let { page = '0' } = req.query
    delete req.query.page
    page = Number(page)
    if (isNaN(page))
      page = 0
    page = page < 0 ? 0 : page

    if (req.query.firstName) req.query.firstName = ({$regex: fuzzy(req.query.firstName), $options: 'i'})
    if (req.query.lastName) req.query.lastName = ({$regex: fuzzy(req.query.lastName), $options: 'i'})
    if (req.query.city) req.query.city = ({$regex: fuzzy(req.query.city), $options: 'i'})
    if (req.query.state) req.query.state = ({$regex: fuzzy(req.query.state), $options: 'i'})

    let employeesCache
    Employee.find(req.query)
      .skip(page * 100)
      .limit(100)
      .then(employees => {
        employeesCache = employees
        return Employee.find(req.query).count()
      })
      .then(count => {
        let result = {
          count,
          data: employeesCache,
        }

        let lastPage = Math.floor(count / 100)
        res.links({
          next: `http://localhost/employees?page=${page + 1}`,
          prev: `http://localhost/employees?page=${page < 1 ? 0 : page - 1}`,
          last: `http://localhost/employees?page=${lastPage}`,
        })
        res.json(result)
      })
      .catch(next)
  })

  .put('/employees/:id', bearerAuth, (req, res, next) => {
    if (!req.body.firstName || !req.body.lastName)
      return next(httpErrors(400, 'first name and last name required'))
    Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .then(employee => {
        if (!employee)
          throw httpErrors(404, '__REQUEST_ERROR__ employee not found')
        res.json(employee)
      })
      .catch(next)
  })
