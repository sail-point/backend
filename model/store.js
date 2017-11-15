'use strict'

const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const httpErrors = require('http-errors')

const storeSchema = mongoose.Schema({
  storeName: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  address: {type: String},
  phone: {type: String},
  website: {type: String},
  passwordHash: {type: String, required: true},
  tokenSeed: {type: String, required: true, unique: true},
  created: {type: Date, default: () => new Date()},
})

// Instance methods
storeSchema.methods.passwordVerify = function(password) {
  return bcrypt.compare(password, this.passwordHash)
    .then(correctPassword => {
      if(!correctPassword)
        throw httpErrors(401, '__AUTH_ERROR__ incorrect password')
      return this
    })
}

storeSchema.methods.tokenCreate = function() {
  this.tokenSeed = crypto.randomBytes(64).toString('hex')
  return this.save()
    .then(store => {
      let options = {expiresIn: '7d'}
      return jwt.sign({tokenSeed: store.tokenSeed}, process.env.SECRET, options)
    })
}

storeSchema.methods.update = function(data) {
  let {password} = data
  delete data.password
  return bcrypt.hash(password, 8)
    .then(passwordHash => {
      this.storeName = data.storeName
      this.email = data.email
      this.passwordHash = passwordHash
      this.address = data.address
      this.phone = data.phone
      this.website = data.website
      return this.save()
    })
}

const Store = module.exports = mongoose.model('store', storeSchema)

Store.create = function(data) {
  data = {...data}
  let {password} = data
  delete data.password
  return bcrypt.hash(password, 8)
    .then(passwordHash => {
      data.passwordHash = passwordHash
      data.tokenSeed = crypto.randomBytes(64).toString('hex')
      return new Store(data).save()
    })
}
