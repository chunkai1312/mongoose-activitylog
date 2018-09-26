# mongoose-activitylog

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][codecov-image]][codecov-url]

> A mongoose plugin for logging activities

## Install

```
$ npm install --save mongoose-activitylog
```

## Usage

### Define the Activity model

Add plugin to your `Activity` schema and then use the model methods.

```js
const mongoose = require('mongoose')
const activitylog = require('mongoose-activitylog')

const ActivitySchema = new mongoose.Schema()
ActivitySchema.plugin(activitylog)

const Activity = mongoose.model('Activity', ActivitySchema)
```

### Log an activity

This is the most basic way to log activity:

```js
await new Activity().log('Look mum, I logged something')
```

You can retrieve the activity using the Activity model.

```js
const activity = await Activity.findOne().sort('-createdAt').exec() // returns the last logged activity
activity.description // returns 'Look mum, I logged something'
```

### Set a subject

You can specify on which object the activity is performed by using `performedOn`:

```js
await new Activity()
  .performedOn(someContentDocument)
  .log('edited')

const activity = await Activity.findOne().sort('-createdAt').exec() // returns the last logged activity
activity.subject // returns the document that was passed to `performedOn`
```

The `performedOn()` function has a shorter alias name: `on`

### Set a causer

You can set who or what caused the activity by using `causedBy`:

```js
await new Activity()
  .performedOn(someContentDocument)
  .causedBy(someUserDocument)
  .log('edited')

const activity = await Activity.findOne().sort('-createdAt').exec() // returns the last logged activity
activity.causer // returns the document that was passed to `causedBy`
```

The `causedBy()` function has a shorter alias named: `by`

### Set custom properties

You can add any property you want to an activity by using `withProperties`:

```js
await new Activity()
  .performedOn(someContentDocument)
  .causedBy(someUserDocument)
  .withProperties({ key: 'value' })
  .log('edited')

const activity = await Activity.findOne().sort('-createdAt').exec() // returns the last logged activity
activity.properties // returns `{ key: 'value' }`
activity.getExtraProperty('key') // returns 'value'
```

The `withProperties()` function has a shorter alias named: `with`

## API

- [log()](#log)
- [performedOn()](#performedon)
- [causedBy()](#causedby)
- [withProperties()](#withproperties)
- [withProperty()](#withproperty)
- [useLog()](#uselog)
- [use()](#use)
- [on()](#on)
- [by()](#by)
- [with()](#with)

### log()

```js
log(description: string): Promise
```

Log an activity.

### performedOn()

```js
performedOn(doc: Document): this
```

Specify on which object the activity is performed.

### causedBy()

```js
causedBy(doc: Document): this
```

Set who or what caused the activity.

### withProperties()

```js
withProperties(properties: object): this
```

Add properties to the activity.

### withProperty()

```js
withProperty(key: string, value: any): this
```

Add a property to the activity by key.

### useLog()

```js
useLog(logName: string): this
```

Specify log name of the activity.

### use()

```js
use(logName: string): this
```

Alias of `useLog()`.

### on()

```js
on(doc: Document): this
```

Alias of `performedOn()`.

### by()

```js
by(doc: Document): this
```

Alias of `causedBy()`.

### with()

```js
with(properties: object): this
with(key: string, value: any): this
```

Alias of `withProperties()` / `withProperty()`.

## Note

Inspired by [laravel-activitylog](https://github.com/spatie/laravel-activitylog)

## License

MIT © [Chun-Kai Wang](https://github.com/chunkai1312)

[npm-image]: https://img.shields.io/npm/v/mongoose-activitylog.svg
[npm-url]: https://npmjs.org/package/mongoose-activitylog
[travis-image]: https://img.shields.io/travis/chunkai1312/mongoose-activitylog.svg
[travis-url]: https://travis-ci.org/chunkai1312/mongoose-activitylog
[codecov-image]: https://img.shields.io/codecov/c/github/chunkai1312/mongoose-activitylog.svg
[codecov-url]: https://codecov.io/gh/chunkai1312/mongoose-activitylog
