'use strict'

const mongoose = require('mongoose')
const expect = require('chai').expect
const activitylog = require('../lib')

const PostSchema = new mongoose.Schema({ title: String })
const UserSchema = new mongoose.Schema({ name: String })
const ActivitySchema = new mongoose.Schema()
ActivitySchema.plugin(activitylog, { defaultLogName: 'default' })

const Post = mongoose.model('Post', PostSchema)
const User = mongoose.model('User', UserSchema)
const Activity = mongoose.model('Activity', ActivitySchema)

describe('mongoose-activitylog', () => {
  let post
  let user

  before(() => {
    return mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/activitylog')
  })

  after(() => {
    return mongoose.disconnect()
  })

  beforeEach(async () => {
    post = await new Post({ title: 'new title' }).save()
    user = await new User({ name: 'test user' }).save()
  })

  afterEach(async () => {
    await Post.remove()
    await User.remove()
    await Activity.remove()
  })

  describe('#useLog()', () => {
    it('should use default log name', async () => {
      const activity = new Activity()
      expect(activity.logName).to.equal('default')
    })

    it('should use specific log name', async () => {
      const activity = new Activity().useLog('other-log')
      expect(activity.logName).to.equal('other-log')
    })

    it('should have alias #use()', async () => {
      const activity = new Activity().use('other-log')
      expect(activity.logName).to.equal('other-log')
    })
  })

  describe('#log()', () => {
    it('should log a activity', async () => {
      await new Activity().log('Look mum, I logged something')

      const activity = await Activity.findOne().sort('-createdAt').exec()
      const activities = await Activity.find().sort('-createdAt').exec()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('Look mum, I logged something')
    })
  })

  describe('#performedOn()', () => {
    it('should log a activity with subject', async () => {
      await new Activity()
        .performedOn(post)
        .log('new post')

      const activity = await Activity.findOne().sort('-createdAt').exec()
      const activities = await Activity.find().sort('-createdAt').exec()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(activity.subject).to.have.property('title', 'new title')
    })

    it('should have alias #on()', async () => {
      await new Activity()
        .on(post)
        .log('new post')

      const activity = await Activity.findOne().sort('-createdAt').exec()
      const activities = await Activity.find().sort('-createdAt').exec()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(activity.subject).to.have.property('title', 'new title')
    })

    it('should ignore to set subject when subject is undefined', async () => {
      expect(new Activity().performedOn().subject).to.be.null
    })

    it('should throw error when subject is not a mongoose document', async () => {
      expect(() => new Activity().performedOn(null)).to.throw()
    })
  })

  describe('#causedBy()', () => {
    it('should log a activity with causer', async () => {
      await new Activity()
        .performedOn(post)
        .causedBy(user)
        .log('new post')

      const activity = await Activity.findOne().sort('-createdAt').exec()
      const activities = await Activity.find().sort('-createdAt').exec()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(activity.subject).to.have.property('title', 'new title')
      expect(activity.causer).to.have.property('name', 'test user')
    })

    it('should have alias #by()', async () => {
      await new Activity()
        .on(post)
        .by(user)
        .log('new post')

      const activity = await Activity.findOne().sort('-createdAt').exec()
      const activities = await Activity.find().sort('-createdAt').exec()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(activity.subject).to.have.property('title', 'new title')
      expect(activity.causer).to.have.property('name', 'test user')
    })

    it('should ignore to set causer when causer is undefined', async () => {
      expect(new Activity().causedBy().causer).to.be.null
    })

    it('should throw error when causer is not a mongoose document', async () => {
      expect(() => new Activity().causedBy(null)).to.throw()
    })
  })

  describe('#withProperties()', () => {
    it('should log a activity with properties', async () => {
      await new Activity()
        .performedOn(post)
        .causedBy(user)
        .withProperties({ key: 'value' })
        .log('new post')

      const activity = await Activity.findOne().sort('-createdAt').exec()
      const activities = await Activity.find().sort('-createdAt').exec()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(activity.subject).to.have.property('title', 'new title')
      expect(activity.causer).to.have.property('name', 'test user')
      expect(activity.properties).to.eql({ key: 'value' })
      expect(activity.getExtraProperty('key')).to.equal('value')
    })

    it('should have alias #with()', async () => {
      await new Activity()
        .on(post)
        .by(user)
        .with({ key: 'value' })
        .log('new post')

      const activity = await Activity.findOne().sort('-createdAt').exec()
      const activities = await Activity.find().sort('-createdAt').exec()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(activity.subject).to.have.property('title', 'new title')
      expect(activity.causer).to.have.property('name', 'test user')
      expect(activity.properties).to.eql({ key: 'value' })
      expect(activity.getExtraProperty('key')).to.equal('value')
    })
  })

  describe('#withProperty()', () => {
    it('should log a activity with property', async () => {
      await new Activity()
        .performedOn(post)
        .causedBy(user)
        .withProperty('key', 'value')
        .log('new post')

      const activity = await Activity.findOne().sort('-createdAt').exec()
      const activities = await Activity.find().sort('-createdAt').exec()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(activity.subject).to.have.property('title', 'new title')
      expect(activity.causer).to.have.property('name', 'test user')
      expect(activity.properties).to.eql({ key: 'value' })
      expect(activity.getExtraProperty('key')).to.equal('value')
    })

    it('should have alias #with()', async () => {
      await new Activity()
        .on(post)
        .by(user)
        .with('key', 'value')
        .log('new post')

      const activity = await Activity.findOne().sort('-createdAt').exec()
      const activities = await Activity.find().sort('-createdAt').exec()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(activity.subject).to.have.property('title', 'new title')
      expect(activity.causer).to.have.property('name', 'test user')
      expect(activity.properties).to.eql({ key: 'value' })
      expect(activity.getExtraProperty('key')).to.equal('value')
    })
  })
})
