var test = require('tap').test
var level = require('level-mem')
var spaces = require('level-spaces')
var ttl = require('../index.js')

test('basic functionality', function (t) {
	t.plan(7)
	var db = level('hello')
	var ttlDb = spaces(db, 'ttl-expiration')
	ttl(db, {ttl: 1000, checkInterval: 50, db: ttlDb})
	db.put('hi', 'wuzzup', t.notOk.bind(t))
	setTimeout(function () { //before ttl
		db.get('hi', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')
		})
	}, 900)
	setTimeout(function () { //after ttl
		db.get('hi', function (err, value) {
			t.ok(err, 'got an error')
			t.ok(err && err.notFound, 'got a notFound error')
			t.notOk(value, 'did not get a value')
			t.end()
		})
	}, 1100)
})
