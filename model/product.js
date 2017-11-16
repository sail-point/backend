'use strict'

const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  image: { type: String },
  available: { type: Boolean },
  created: { type: Date, default: () => new Date() },
  store: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'store' },
})

module.exports = mongoose.model('product', productSchema)
