var test = require('tap').test
var level = require('level-mem')
var ttl = require('../index.js')

test('no errors if entry is deleted', function (t) {
	var db = level('hello')
	ttl(db, {
		ttl: 100,
		checkInterval: 20
	})
	db.on('error', t.fail.bind(t))
	db.put('hi', 'wuzzup', t.notOk.bind(t))
	setTimeout(db.del.bind(db, 'hi', t.notOk.bind(t)), 70) //before ttl
	setTimeout(t.end.bind(t), 130) //if an error is thrown, it should show
})
