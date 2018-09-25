'use strict'

const mongoose = require('mongoose')

module.exports = function (schema, options) {
  options = options || /* istanbul ignore next */ { defaultLogName: 'default' }

  schema.add({
    logName: { type: String, default: options.defaultLogName },
    description: { type: String },
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    subjectType: { type: String },
    causerId: { type: mongoose.Schema.Types.ObjectId },
    causerType: { type: String },
    properties: { type: mongoose.Schema.Types.Mixed }
  })

  schema.set('timestamps', true)

  schema.virtual('subject', {
    ref: doc => doc.subjectType,
    localField: 'subjectId',
    foreignField: '_id',
    justOne: true
  })

  schema.virtual('causer', {
    ref: doc => doc.causerType,
    localField: 'causerId',
    foreignField: '_id',
    justOne: true
  })

  schema.methods = {
    useLog: function (logName) {
      this.logName = logName
      return this
    },
    performedOn: function (subject) {
      this.subjectId = subject.id || /* istanbul ignore next */ subject._id
      this.subjectType = subject.constructor.modelName
      return this
    },
    causedBy: function (causer) {
      this.causerId = causer.id || /* istanbul ignore next */ causer._id
      this.causerType = causer.constructor.modelName
      return this
    },
    withProperties: function (properties) {
      this.properties = properties
      return this
    },
    withProperty: function (key, value) {
      this.properties = this.properties || {}
      this.properties[key] = value
      return this
    },
    log: function (description, options) {
      this.description = description
      return this.save()
    },
    getExtraProperty: function (key) {
      return this.properties[key]
    }
  }

  schema.methods.use = schema.methods.useLog
  schema.methods.on = schema.methods.performedOn
  schema.methods.by = schema.methods.causedBy
  schema.methods.with = function () {
    if (arguments.length === 2) return schema.methods.withProperty.apply(this, arguments)
    return schema.methods.withProperties.apply(this, arguments)
  }

  const autopopulateHandler = function (next) {
    this.populate('subject causer')
    next()
  }

  schema
    .pre('findOne', autopopulateHandler)
    .pre('find', autopopulateHandler)
}
