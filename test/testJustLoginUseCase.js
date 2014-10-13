var test = require('tap').test
var spaces = require('level-spaces')
var Levelup = require('level-mem')
var ttl = require('../index.js')

var ttlMs = 3000
var checkWindow = 250
var fakeToken = 'hahalolthisisnotveryivenow'
var fakeContactAddress = 'example@example.com'
var fakeSessionId = 'whatever'
var fakeTokenData = {
	sessionId: fakeSessionId,
	contactAddress: fakeContactAddress
}


test('test for authenticate', function (t) {
	var db = Levelup('newThang')

	//NO USING THESE VARS vvv (faking the just-login-core below...)
	var _JLCtokenDb = spaces(db, 'token')
	ttl(_JLCtokenDb, {ttl: ttlMs, checkInterval: 100})
	_JLCtokenDb.on('put', console.log.bind(console, 'jlc sees put:'))
	//_JLCtokenDb.put(fakeToken, 'hi', dbTokenOpts, t.notOk.bind(t))
	//NO USING THESE VARS ^^^

	var dbTokenOpts = {
		keyEncoding: 'utf8',
		valueEncoding: 'json'
	}

	var tokenDb = spaces(db, 'token')

	tokenDb.put(fakeToken, fakeTokenData, dbTokenOpts, function (err) {
		t.notOk(err, "no error in db.put()")
	})

	setTimeout(function () {
		tokenDb.get(fakeToken, dbTokenOpts, function (err, credentials) {
			console.dir(credentials)
			console.dir(JSON.stringify(fakeTokenData))
			t.notOk(err, "no error in 1st db.get()")
			t.notOk(err && err.notFound, "no 'not found' error in 1st db.get()")
			t.ok(credentials, "credentials come back in 1st db.get()")
			t.deepEqual(credentials, JSON.stringify(fakeTokenData), "credentials are correct in 1st db.get()")
		})
	}, ttlMs-checkWindow)

	setTimeout(function () {
		tokenDb.get(fakeToken, dbTokenOpts, function (err, credentials) {
			//t.type(err, 'object', "err is an object")
			//t.ok(err instanceof Error, "err is an error in 2nd db.get()")
			t.ok(err, "error in 2nd db.get()", {skip: true}) //Enable skipped tests later
			t.ok(err && err.notFound, "'not found' error", {skip: true})
			t.type(credentials, 'undefined', "credentials are undefined", {skip: true})
			t.notOk(credentials, "credentials don't come back", {skip: true})
			t.notDeepEqual(credentials, fakeTokenData, "credentials are incorrect", {skip: true})
			
			t.end()
		})
	}, ttlMs+checkWindow)

	setTimeout(t.end.bind(t), 4000)
})
