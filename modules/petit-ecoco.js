/*!
 * echo example
 */
(function() {
var nylon = require("../lib/nylon");
var sys = require("sys");

function Module() {
	// inherit
	nylon.Module.call(this);
	
	this.id = "ecoco";
	
	// prepare
	var self = this;

	// private properties
	var userlist = {};
	
	// initialize
	self.on("ecoco_connect", function(param, packet) {
		for (var n in userlist) {
			if (packet.from != userlist[n].name && userlist[n].granted) {
				self.send("ecoco_connect", packet.from, userlist[n]);
			}
		}
		
		userlist[packet.from.name] = packet.from;
	});
	
	self.on("ecoco_get", function(param, packet) {
		if (param.type = "list")
			self.send("ecoco_get", {
				type: list, list: userlist
			}, packet.from);
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
