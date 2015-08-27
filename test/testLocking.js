var test = require('tape')
var level = require('level-mem')
var ttl = require('../index.js')
var lock = require('level-lock')

test('basic locking', function (t) {
	var db = level('hello')
	ttl(db, {
		ttl: 100,
		checkInterval: 20
	})
	db.put('hi', 'wuzzup')
	var unlock = undefined
	db.on('error', t.fail.bind(t))
	setTimeout(function () { //before ttl
		unlock = lock(db, 'hi', 'w')
		t.ok(unlock, 'got lock')
	}, 70)
	setTimeout(function () { //after ttl
		unlock()
		db.get('hi', function (err, value) {
			t.notOk(err, 'no error')
			t.notOk(err && err.notFound, 'no "notFound" error')
			t.ok(value, 'key exists, idk if that is good')
		})
	}, 130)
	setTimeout(function () {
		db.get('hi', function (err, value) { //does it retry?
			t.ok(err, 'error')
			t.ok(err && err.notFound, '"notFound" error')
			t.notOk(value, 'key does not exist')
		})
		t.end()
	}, 220)
})

test('more locking and deletions', function (t) {
	var db = level('hello')
	ttl(db, {
		ttl: 100,
		checkInterval: 20
	})
	db.put('hi', 'wuzzup')
	var unlock = undefined
	db.on('error', t.fail.bind(t))
	setTimeout(function () { //before ttl
		unlock = lock(db, 'hi', 'w')
		t.ok(unlock, 'got lock')
	}, 70)
	setTimeout(function () { //after ttl
		db.del('hi', function (err) {
			t.notOk(err, 'no error on deletion')
			unlock()
		})
	}, 130)
	setTimeout(t.end.bind(t), 220)
})
