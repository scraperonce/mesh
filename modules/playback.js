/*!
 * echo example
 */
(function() {
var nylon = require("../lib/nylon");
var sys = require("sys");
var app = require("../init.js");
var db = app.db;

function Module() {
	// inherit
	nylon.Module.call(this);
	
	this.id = "playback";
	
	// prepare
	var self = this;

	// private properties
	var userlist = {};
	
	// initialize
	self.on("playback_load", function(param, packet) {
		var sql = "SELECT * FROM logs WHERE id = ?";
		var id = Number(param.id);
		if (!isNaN(id)) {
			db.connect();
			db.query(sql, [id], function(err, rows) {
				db.end();
				self.queue("playback_load", {
					events: JSON.parse(rows.pop().json)
				});
			});
		}
	});
	
	self.on("playback_play", function(param, packet) {
		self.queue("playback_play", {
			beginTime: (new Date()).getTime()
		});
	});
	
}
// inherit
sys.inherits(Module, nylon.Module);

module.exports = {
	Module: Module,
	create: function() {
		return new Module();
	}
};
})();
