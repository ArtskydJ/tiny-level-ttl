var test = require('tap').test
var level = require('level-mem')
var ttl = require('../index.js')

test('throw error on bad db', function (t) {
	t.plan(1)
	var db = level('hello')
	try {
		ttl(null)
		t.fail('bad db must throw error')
	} catch (err) {
		t.equal(err.message, 'You must pass a level database to ttl()', 'correct error message')
	}
	t.end()
})
