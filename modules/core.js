/*!
 * echo example
 */
(function() {
var nylon = require("../lib/nylon");
var sys = require("sys");

function Module() {
	// inherit
	nylon.Module.call(this);
	
	this.id = "core";
	
	// prepare
	var self = this;

	// private properties
	var names = {};
	
	// private methods
	
	// initialize
	self.on("core_pageto|core_clear", function(param, packet) {
		if (packet.from.granted == true) {
			self.queue(packet.type, param);
		}
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
