var test = require('tap').test
var level = require('level-mem')
var sublevel = require('level-sublevel')
var ttl = require('../index.js')

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
