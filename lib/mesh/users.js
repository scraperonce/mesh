/**
 * Module dependencies.
 */


var exports = module.exports = {};

exports.search = function(name, fn) {
	var db = new (require("./db")).Client();
	var sql = db.format("SELECT * FROM users WHERE name = ?", [name]);
	db.connect();
	db.query(sql, function(err, rows) {
		db.end();
		
		var user = rows[0];
		if (rows.length == 1) {
			var pass = user.password;
			user.password = function(p) {
				return (pass == p);
			}
			fn(user);
		} else {
			fn(null);
		}
	});
}
