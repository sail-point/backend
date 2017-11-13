'use strict'

const mongoose = require('mongoose')

const employeeSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  title: { type: String, required: true },
  email: { type: String, required: true },
  phoneNum: { type: String, required: true },
  hrsPerWk: { type: Number, required: true },
  salaryPerHr: { type: Number, required: true },
  pin: {type: String, default: null},
  hired: {type: Date },
  terminated: {type: Date, default: null},
  store: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
})

module.exports = mongoose.model('employee', employeeSchema)
