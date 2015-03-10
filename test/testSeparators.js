var test = require('tap').test
var level = require('level-mem')
var spaces = require('level-spaces')
var ttl = require('../index.js')

test('separators work', function (t) {
	t.plan(14)

	var db = level('hello')
	var ttlDb = spaces(db, 'ttl-expiration', { separator: '\xff' })

	ttl(db, {
		ttl: 1000,
		checkInterval: 50,
		separator: '\xff'
	})

	db.put('hi\x00', 'wuzzup', t.notOk.bind(t))
	db.put('hello\xff', 'coolness', t.notOk.bind(t))

	setTimeout(function () { //before ttl
		db.get('hi\x00', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')

			db.get('hello\xff', function (err, value) {
				t.notOk(err, 'did not get an error')
				t.notOk(err && err.notFound, 'did not get a notFound error')
				t.equal(value, 'coolness', 'got back the expected value')
			})
		})
	}, 900)

	setTimeout(function () { //after ttl
		db.get('hi\x00', function (err, value) {
			t.ok(err, 'got an error')
			t.ok(err && err.notFound, 'got a notFound error')
			t.notOk(value, 'did not get a value')

			db.get('hello\xff', function (err, value) {
				t.notOk(err, 'did not get an error')
				t.notOk(err && err.notFound, 'did not get a notFound error')
				t.equal(value, 'coolness', 'got back the expected value')

				t.end()
			})
		})
	}, 1100)
})

test('separators work', function (t) {
	t.plan(6)

	var db = level('hello')
	var ttlDb = spaces(db, 'ttl-expiration', { separator: 'x' })

	ttl(db, {
		ttl: 1000,
		checkInterval: 50,
		separator: 'x'
	})

	db.put('hi', 'wuzzup', t.notOk.bind(t))
	db.put('hellox', 'coolness', t.notOk.bind(t))

	setTimeout(function () { //before ttl
		db.get('hi', function (err, value) {
			t.equal(value, 'wuzzup')
		})
		db.get('hellox', function (err, value) {
			t.equal(value, 'coolness')
		})
	}, 900)

	setTimeout(function () { //after ttl
		db.get('hi\x00', function (err, value) {
			t.notOk(value)
			db.get('hellox', function (err, value) {
				t.equal(value, 'coolness')

				t.end()
			})
		})
	}, 1100)
})
