'use strict'

const { Router } = require('express')
const httpErrors = require('http-errors')
const bearerAuth = require('../lib/bearer-auth-middleware.js')
const Employee = require('../model/employee.js')

const apiURL = `${process.env.API_URL}`

let fuzzy = (filterTerm) => new RegExp('.*' + filterTerm.toLowerCase().split('').join('.*') + '.*')

module.exports = new Router()
  .post('/employees', bearerAuth, (req, res, next) => {
    return new Employee({
      ...req.body,
      store: req.store._id,
    }).save()
      .then(employee => {
        if(!employee)
          throw httpErrors(404, 'employee could not be created')
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
    if (req.query.title) req.query.title = ({$regex: fuzzy(req.query.title), $options: 'i'})

    let employeesCache
    Employee.find({...req.query, store: req.store._id})
      .skip(page * 10)
      .limit(10)
      .then(employees => {
        employeesCache = employees
        return Employee.find({...req.query, store: req.store._id}).count()
      })
      .then(count => {
        let result = {
          count,
          data: employeesCache,
        }

        let lastPage = Math.floor(count / 10)
        res.links({
          next: `${apiURL}/employees?page=${page + 1}`,
          prev: `${apiURL}/employees?page=${page < 1 ? 0 : page - 1}`,
          last: `${apiURL}/employees?page=${lastPage}`,
        })
        res.json(result)
      })
      .catch(next)
  })
  .get('/employees/pin/:pin', bearerAuth, (req, res, next) => {
    Employee.findOne({pin: req.params.pin})
      .then(employee => {
        if (!employee)
          throw httpErrors(404, '__REQUEST_ERROR__ employee not found')
        if(employee.pin.length !== 4)
          throw httpErrors(400, 'pin must have four characters')
        res.json(employee)
      })
      .catch(next)
  })
  .put('/employees/:id', bearerAuth, (req, res, next) => {
    console.log('lulwat')
    Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .then(employee => {
        console.log({employee})
        if (!employee)
          throw httpErrors(404, '__REQUEST_ERROR__ employee not found')
        res.json(employee)
      })
      .catch(next)
  })
  .delete('/employees/:id', bearerAuth, (req, res, next) => {
    Employee.findByIdAndRemove(req.params.id)
      .then(() => res.sendStatus(204))
      .catch(next)
  })
