var test = require('tape')
var ttl = require('../index.js')

test('throw error on bad db', function (t) {
	t.plan(1)
	t.throws(ttl, 'throws an error')
	t.end()
})
