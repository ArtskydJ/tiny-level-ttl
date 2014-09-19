var test = require('tap').test
var level = require('level-mem')
var sublevel = require('level-sublevel')
var ttl = require('./index.js')

test('basic functionality', function (t) {
	t.plan(6)
	var db = level('hello')
	db = sublevel(db)
	ttl(db, 1000, 50)
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
			t.notOk(value, 'did not get an value')
			t.end()
		})
	}, 1100)
})

test('delay expiration with put()', function (t) {
	t.plan(10)
	var db = level('hello')
	db = sublevel(db)
	ttl(db, 1000, 50)
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
			t.notOk(value, 'did not get an value')
			t.end()
		})
	}, 2000)
})

test('still works in a sublevel', function (t) {
	t.plan(10)
	var db = level('hello')
	db = sublevel(db)
	var useDb = db.sublevel('test')
	ttl(useDb, 1000, 50)

	var puts = 0
	useDb.on('put', function () { puts++ })

	useDb.put('hi', 'wuzzup')
	db.put('original', 'no_timeout')
	setTimeout(function () { //before ttl
		useDb.get('hi', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')
		})
	}, 900)
	setTimeout(function () { //after ttl
		useDb.get('hi', function (err, value) {
			t.ok(err, 'got an error')
			t.ok(err && err.notFound, 'got a notFound error')
			t.notOk(value, 'did not get an value')
			t.equal(puts, 1, 'one put() call')

			db.get('original', function (err, value) {
				t.notOk(err, 'original - did not get an error')
				t.notOk(err && err.notFound, 'original - did not get a notFound error')
				t.equal(value, 'no_timeout', 'original - got back the expected value')
				t.end()
			})
		})
		
	}, 1100)
})

test('no errors if entry is deleted', function (t) {
	var db = level('hello')
	db = sublevel(db)
	ttl(db, 1000, 100)
	db.on('error', t.fail.bind(t))
	db.put('hi', 'wuzzup', t.notOk.bind(t))
	setTimeout(db.del.bind(db, 'hi', t.notOk.bind(t)), 200) //before ttl
	setTimeout(t.end.bind(t), 1300) //if an error is thrown, it should show
})
