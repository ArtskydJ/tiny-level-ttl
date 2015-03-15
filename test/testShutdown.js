var test = require('tap').test
var EventEmitter = require('events').EventEmitter
var ttl = require('../index.js')

test('closes handlers on closing event', function (t) {
	t.plan(2)
	var db = new EventEmitter()
	db.sublevel = function () {}
	ttl(db)
	setTimeout(function () {
		t.equal(typeof db.refreshTtl, 'function', 'not shutdown yet')
		db.emit('closing') // Emitters are synchronous
		t.equal(typeof db.refreshTtl, 'undefined', 'is shutdown')
		t.end()
	}, 5)
})
