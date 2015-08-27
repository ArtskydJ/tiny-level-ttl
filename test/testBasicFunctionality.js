var test = require('tape')
var level = require('level-mem')
var spaces = require('level-spaces')
var ttl = require('../index.js')

test('basic functionality', function (t) {
	t.plan(7)
	var db = level('hello')
	var ttlDb = spaces(db, 'ttl-expiration')
	ttl(db, {
		ttl: 100,
		checkInterval: 20
	})
	db.put('hi', 'wuzzup', t.notOk.bind(t))
	setTimeout(function () { //before ttl
		db.get('hi', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')
		})
	}, 70)
	setTimeout(function () { //after ttl
		db.get('hi', function (err, value) {
			t.ok(err, 'got an error')
			t.ok(err && err.notFound, 'got a notFound error')
			t.notOk(value, 'did not get a value')
			t.end()
		})
	}, 130)
})
