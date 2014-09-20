var test = require('tap').test
var level = require('level-mem')
var sublevel = require('level-sublevel')
var ttl = require('../index.js')

test('basic functionality', function (t) {
	t.plan(6)
	var db = level('hello')
	db = sublevel(db)
	ttl(db, {ttl: 1000, checkInterval: 50})
	db.put('hi', 'wuzzup')
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
