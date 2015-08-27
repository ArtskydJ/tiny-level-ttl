var test = require('tape')
var level = require('level-mem')
var ttl = require('../index.js')

test('closes handlers on closing event', function (t) {
	var db = new level()
	db.sublevel = level
	ttl(db)

	t.equal(typeof db.refreshTtl, 'function', 'not shutdown yet')
	db.emit('closing')
	t.equal(typeof db.refreshTtl, 'undefined', 'is shutdown')

	var fail = t.fail.bind(t, 'uncaught exception')
	process.on('uncaughtException', fail)
	setTimeout(function () {
		process.removeListener('uncaughtException', fail)
		t.end()
	}, 100)
})
