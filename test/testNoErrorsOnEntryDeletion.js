var test = require('tap').test
var level = require('level-mem')
var sublevel = require('level-sublevel')
var ttl = require('../index.js')

test('no errors if entry is deleted', function (t) {
	var db = level('hello')
	db = sublevel(db)
	ttl(db, {ttl: 1000, checkInterval: 100})
	db.on('error', t.fail.bind(t))
	db.put('hi', 'wuzzup', t.notOk.bind(t))
	setTimeout(db.del.bind(db, 'hi', t.notOk.bind(t)), 200) //before ttl
	setTimeout(t.end.bind(t), 1300) //if an error is thrown, it should show
})
