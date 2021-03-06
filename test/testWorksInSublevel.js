var test = require('tape')
var level = require('level-mem')
var sublevel = require('level-sublevel')
var ttl = require('../index.js')

test('still works in a sublevel', function (t) {
	var db = level('hello')
	db = sublevel(db)
	var useDb = db.sublevel('test')
	ttl(useDb, {
		ttl: 100,
		checkInterval: 20
	})

	var puts = 0
	useDb.on('put', function () { puts++ })

	useDb.put('hi', 'wuzzup')
	db.put('hi', 'no_timeout')
	setTimeout(function () { //before ttl
		useDb.get('hi', function (err, value) { //has value in sub db
			t.notOk(err, 'did not get an error')
			t.notOk(err && err.notFound, 'did not get a notFound error')
			t.equal(value, 'wuzzup', 'got back the expected value')

			db.get('hi', function (err, value) { //has value in original db
				t.notOk(err, 'original - did not get an error')
				t.notOk(err && err.notFound, 'original - did not get a notFound error')
				t.equal(value, 'no_timeout', 'original - got back the expected value')
			})
		})
	}, 70)
	setTimeout(function () { //after ttl
		useDb.get('hi', function (err, value) { //does not have value in sub db
			t.ok(err, 'got an error')
			t.ok(err && err.notFound, 'got a notFound error')
			t.notOk(value, 'did not get a value')
			t.equal(puts, 1, 'one put() call')

			db.get('hi', function (err, value) { //has value in original db
				t.notOk(err, 'original - did not get an error')
				t.notOk(err && err.notFound, 'original - did not get a notFound error')
				t.equal(value, 'no_timeout', 'original - got back the expected value')
				t.end()
			})
		})

	}, 130)
})
