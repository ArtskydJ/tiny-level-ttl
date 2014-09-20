var Expirer = require('expire-unused-keys')
var xtend = require('xtend')

module.exports = function ttl(db, opts) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	} else if (!db.sublevel) {
		throw new Error('You must pass a level-sublevel ready database')
	}
	opts = xtend({ttl: 3600000, checkInterval: 10000}, opts)
	console.dir(opts)
	var expirer = new Expirer(opts.ttl, db.sublevel('expirer'), opts.checkInterval)
	//db.on('put', expirer.touch.bind(expirer))
	//expirer.on('expire', db.del.bind(db))
	db.on('put', function (key) {
		console.log('touching ' + key)
		expirer.touch(key)
	})
	expirer.on('expire', function (key) {
		console.log('deleting ' + key)
		db.del(key)
	})
}
