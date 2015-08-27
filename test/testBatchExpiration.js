var test = require('tape')
var level = require('level-mem')
var ttl = require('../index.js')

test('basic functionality', function (t) {
	t.plan(12)
	var db = level('hello')
	ttl(db, {
		ttl: 100,
		checkInterval: 20
	})
	db.batch([
		{type: 'put', key: 'hi', value:'wuzzup'},
		{type: 'put', key: 'smile', value: 'you are on camera'}
	])
	setTimeout(function () { //before ttl
		db.get('hi', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')
		})
		db.get('smile', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'you are on camera', 'got back the expected value')
		})
	}, 70)
	setTimeout(function () { //after ttl
		db.get('hi', function (err, value) {
			t.ok(err, 'got an error')
			t.ok(err && err.notFound, 'got a notFound error')
			t.notOk(value, 'did not get a value')
		})
		db.get('smile', function (err, value) {
			t.ok(err, 'got an error')
			t.ok(err && err.notFound, 'got a notFound error')
			t.notOk(value, 'did not get a value')
		})
	}, 130)
})
