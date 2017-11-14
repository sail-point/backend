'use strict'

const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  price: { type: Number },
  image: { type: String },
  vegan: { type: Boolean },
  vegetarian: { type: Boolean },
  glutenFree: { type: Boolean },
  available: { type: Boolean },
  created: { type: Date, default: () => new Date() },
  store: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'store' },
})

module.exports = mongoose.model('product', productSchema)
