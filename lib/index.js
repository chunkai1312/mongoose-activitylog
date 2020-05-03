'use strict'

const mongoose = require('mongoose')

module.exports = function (schema, options) {
  options = options || /* istanbul ignore next */ { defaultLogName: 'default' }

  // Add fields to the schema
  schema.add({
    logName: { type: String, default: options.defaultLogName },
    description: { type: String },
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    subjectType: { type: String },
    causerId: { type: mongoose.Schema.Types.ObjectId },
    causerType: { type: String },
    properties: { type: mongoose.Schema.Types.Mixed }
  })

  // Set timestamps to assign `createdAt` and `updatedAt` fields
  schema.set('timestamps', true)

  // Set the `subject` virtual property
  schema.virtual('subject', {
    ref: doc => doc.subjectType,
    localField: 'subjectId',
    foreignField: '_id',
    justOne: true
  })

  // Set the `causer` virtual property
  schema.virtual('causer', {
    ref: doc => doc.causerType,
    localField: 'causerId',
    foreignField: '_id',
    justOne: true
  })

  // Always attach `populate()` to `find()` calls
  schema.pre('find', function () {
    this.populate('subject causer')
  })

  // Always attach `populate()` to `findOne()` calls
  schema.pre('findOne', function () {
    this.populate('subject causer')
  })

  /**
   * Log an activity.
   *
   * @param {String} description - The description of logging activity.
   * @returns {Promise}
   */
  schema.methods.log = function (description) {
    this.description = description
    return this.save()
  }

  /**
   * Specify on which object the activity is performed.
   *
   * @param {Document} doc - The mongoose document.
   * @returns {this}
   */
  schema.methods.performedOn = function (doc) {
    if (typeof doc === 'undefined' || doc === 'init') return this
    if (!(doc instanceof mongoose.Document)) throw TypeError('Invalid performedOn() argument. Must be `mongoose.Document`.')
    this.subjectId = doc._id
    this.subjectType = doc.constructor.modelName
    return this
  }

  /**
   * Set who or what caused the activity.
   *
   * @param {Document} doc - The mongoose document.
   * @returns {this}
   */
  schema.methods.causedBy = function (doc) {
    if (typeof doc === 'undefined' || doc === 'init') return this
    if (!(doc instanceof mongoose.Document)) throw TypeError('Invalid causedBy() argument. Must be `mongoose.Document`.')
    this.causerId = doc._id
    this.causerType = doc.constructor.modelName
    return this
  }

  /**
   * Add properties to the activity.
   *
   * @param {Object} properties - The properties.
   * @returns {this}
   */
  schema.methods.withProperties = function (properties) {
    this.properties = properties
    return this
  }

  /**
   * Add a property to the activity by key.
   *
   * @param {Object} properties - The properties.
   * @returns {this}
   */
  schema.methods.withProperty = function (key, value) {
    this.properties = this.properties || {}
    this.properties[key] = value
    return this
  }

  /**
   * Get value of the property.
   *
   * @param {String} key - The key of the property.
   * @returns {any} - The value of the key.
   */
  schema.methods.getExtraProperty = function (key) {
    return this.properties[key]
  }

  /**
   * Specify log name of the activity.
   *
   * @param {String} logName - The log name of the activity.
   * @returns {this}
   */
  schema.methods.useLog = function (logName) {
    this.logName = logName
    return this
  }

  /**
   * Alias of useLog()
   *
   * @alias schema.methods.useLog
   */
  schema.methods.use = schema.methods.useLog

  /**
   * Alias of performedOn()
   *
   * @alias schema.methods.performedOn
   */
  schema.methods.on = schema.methods.performedOn

  /**
   * Alias of causedBy()
   *
   * @alias schema.methods.causedBy
   */
  schema.methods.by = schema.methods.causedBy

  /**
   * Alias of withProperties() / withProperty()
   *
   * @alias schema.methods.withProperties
   * @alias schema.methods.withProperty
   */
  schema.methods.with = function () {
    if (arguments.length === 2) return schema.methods.withProperty.apply(this, arguments)
    return schema.methods.withProperties.apply(this, arguments)
  }
}
