'use strict'

const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
  date: {type: Date, default: () => new Date()},
  isOpen: {type: Boolean, default: true},
  amount: {type: Number},
  products: [{type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product'}],
  employee: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'employee'},
})

module.exports = mongoose.model('order', orderSchema)
