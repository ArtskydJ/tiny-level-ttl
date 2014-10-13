var test = require('tap').test
var level = require('level-mem')
var spaces = require('level-spaces')
var ttl = require('../index.js')

test('works in a space with the same name with a set ttl db', function (t) {
	var db = level('hello')
	var putDb = spaces(db, 'test') //maybe the same as the one below?
	var useDb = spaces(db, 'test') //maybe the same as the one above?
	var ttlDb = spaces(db, 'ttl-operations')
	ttl(useDb, {
		ttl: 1000,
		db: ttlDb,
		checkInterval: 50
	})

	var puts = 0
	useDb.on('put', function () { puts++ })

	putDb.put('hi', 'wuzzup', t.notOk.bind(t))
	setTimeout(function () { //before ttl
		useDb.get('hi', function (err, value) { //has value in sub db
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')
		})
	}, 900)
	setTimeout(function () { //after ttl
		useDb.get('hi', function (err, value) { //does not have value in sub db
			t.ok(err, 'got an error', {skip: true})
			t.ok(err && err.notFound, 'got a notFound error', {skip: true})
			t.notOk(value, 'did not get a value', {skip: true})
			t.equal(puts, 1, 'one put() call', {skip: true})
			t.end()
		})
	}, 1100)
})

test('works in a space with the same name without a set ttl db', function (t) {
	var db = level('hello')
	var putDb = spaces(db, 'test') //maybe the same as the one below?
	var useDb = spaces(db, 'test') //maybe the same as the one above?
	ttl(useDb, {
		ttl: 1000,
		checkInterval: 50
	})

	var usePuts = 0
	useDb.on('put', function () { usePuts++ })

	putDb.put('hi', 'wuzzup', t.notOk.bind(t))
	setTimeout(function () { //before ttl
		useDb.get('hi', function (err, value) { //has value in sub db
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')
		})
	}, 900)
	setTimeout(function () { //after ttl
		useDb.get('hi', function (err, value) { //does not have value in sub db
			t.ok(err, 'got an error', {skip: true})
			t.ok(err && err.notFound, 'got a notFound error', {skip: true})
			t.notOk(value, 'did not get a value', {skip: true})
			t.equal(usePuts, 1, 'one put() call', {skip: true})
			t.end()
		})
	}, 1100)
})