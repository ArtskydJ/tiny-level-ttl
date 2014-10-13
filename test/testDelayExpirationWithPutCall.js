var test = require('tap').test
var level = require('level-mem')
var ttl = require('../index.js')

test('delay expiration with put()', function (t) {
	t.plan(10)
	var db = level('hello')
	ttl(db, {ttl: 1000, checkInterval: 50})
	db.put('hi', 'wuzzup')
	setTimeout(function () { //delay ttl
		db.get('hi', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')

			db.put('hi', 'hola', function (err) {
				t.notOk(err, 'did not get an error')
			})
		})
	}, 900)
	setTimeout(function () { //before ttl
		db.get('hi', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'hola', 'got back the expected value')
		})
	}, 1800)
	setTimeout(function () { //after ttl
		db.get('hi', function (err, value) {
			t.ok(err, 'got an error')
			t.ok(err && err.notFound, 'got a notFound error')
			t.notOk(value, 'did not get a value')
			t.end()
		})
	}, 2000)
})
