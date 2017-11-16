'use strict'

const mongoose = require('mongoose')

const employeeSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  title: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  hoursPerWeek: { type: Number, required: true },
  salaryPerHour: { type: Number, required: true },
  pin: {type: String, default: Math.random().toString().slice(-4), required: true},
  hired: {type: Date, default: null },
  terminated: {type: Date, default: null},
  store: { type: mongoose.Schema.Types.ObjectId, required: true},
})

module.exports = mongoose.model('employee', employeeSchema)
