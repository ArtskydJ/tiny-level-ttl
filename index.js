var Expirer = require('expire-unused-keys')
var xtend = require('xtend')

module.exports = function ttl(db, opts) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	} else if (!db.sublevel) {
		throw new Error('You must pass a level-sublevel ready database')
	}
	opts = xtend({ttl: 3600000, checkInterval: 10000}, opts) //, refreshOnGet: false
	var expirer = new Expirer(opts.ttl, db.sublevel('expirer'), opts.checkInterval)
	db.on('put', expirer.touch.bind(expirer)) //I hope this is not recursive; touch() calls put() in a subDb
	//opts.refreshOnGet && db.on('get', expirer.touch.bind(expirer)) //leveldb does not emit 'get' events. :(
	expirer.on('expire', db.del.bind(db)) //if err, this will probably throw
}
