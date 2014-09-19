var test = require('tap').test
var level = require('level-mem')
var sublevel = require('level-sublevel')
var ttl = require('./index.js')

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

test('delay expiration with put()', function (t) {
	t.plan(10)
	var db = level('hello')
	db = sublevel(db)
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

/*
//levelup does not emit 'get' events, so this probably isn't going to happen very soon

test('delay expiration with get() when refreshOnGet is true', function (t) {
	t.plan(9)
	var db = level('hello')
	db = sublevel(db)
	ttl(db, {ttl: 1000, checkInterval: 50, refreshOnGet: true})
	db.put('hi', 'wuzzup')
	setTimeout(function () { //delay ttl
		db.get('hi', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')
		})
	}, 900)
	setTimeout(function () { //delay ttl (and test)
		db.get('hi', function (err, value) {
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')
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
})*/

test('still works in a sublevel', function (t) {
	t.plan(10)
	var db = level('hello')
	db = sublevel(db)
	var useDb = db.sublevel('test')
	ttl(useDb, {ttl: 1000, checkInterval: 50})

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
			t.notOk(value, 'did not get a value')
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

test('throw error on bad db', function (t) {
	t.plan(4)
	var db = level('hello')
	try {
		ttl(null)
		t.fail('bad db must throw error')
	} catch (err) {
		t.ok(err.message.indexOf('database')>=0, 'has "database" in error message')
		t.equal(err.message.indexOf('sublevel'), -1, 'does not have "sublevel" in error message')
	}
	try {
		ttl(db)
		t.fail('non subleveled db must throw error')
	} catch (err) {
		t.ok(err.message.indexOf('database')>=0, 'has "database" in error message')
		t.ok(err.message.indexOf('sublevel')>=0, 'has "sublevel" in error message')
	}
	t.end()
})

test('no errors if entry is deleted', function (t) {
	var db = level('hello')
	db = sublevel(db)
	ttl(db, {ttl: 1000, checkInterval: 100})
	db.on('error', t.fail.bind(t))
	db.put('hi', 'wuzzup', t.notOk.bind(t))
	setTimeout(db.del.bind(db, 'hi', t.notOk.bind(t)), 200) //before ttl
	setTimeout(t.end.bind(t), 1300) //if an error is thrown, it should show
})
