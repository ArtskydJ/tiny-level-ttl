var test = require('tap').test
var level = require('level-mem')
var sublevel = require('level-sublevel')
var ttl = require('../index.js')

test('db inheritance and adding refreshTtl() to new db', function (t) {
	var db = level('hello')
	db = sublevel(db)
	var doesNotReturn = ttl(db, {ttl: 1000, checkInterval: 50})

	t.type(db.refreshTtl, 'function', 'database has refresh ttl function')
	t.type(doesNotReturn, 'undefined', 'ttl() returns nothing!')

	t.end()
})

test('delay expiration with get() when refreshOnGet is true', function (t) {
	var db = level('hello')
	db = sublevel(db)
	ttl(db, {ttl: 1000, checkInterval: 50})
	db.put('hi', 'wuzzup')
	setTimeout(function () { //delay ttl
		db.refreshTtl('hi')
	}, 900)
	setTimeout(function () { //delay ttl (and test)
		db.refreshTtl('hi')
		db.get('hi', function (err, value) {
			t.notOk(err, 'got an error')
			t.notOk(err && err.notFound, 'got a notFound error')
			t.equal(value, 'wuzzup', 'did not get a value')
		})
	}, 1100)
	setTimeout(function () { //after ttl
		db.get('hi', function (err, value) {
			t.ok(err, 'got an error')
			t.ok(err && err.notFound, 'got a notFound error')
			t.notOk(value, 'did not get a value')
			t.end()
		})
	}, 2300)
})