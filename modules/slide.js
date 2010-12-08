/*!
 * slide example
 */
(function() {
var nylon = require("../lib/nylon");
var sys = require("sys");

function Module() {
	// inherit
	nylon.Module.call(this);
	
	this.id = "slide";
	
	// prepare
	var self = this;

	// private properties
	// private methods
	
	// initialize
	self.on("slide_load", function(param, packet) {
		if (packet.from.granted == true) {
			self.queue(packet.type, param);
		}
	});
	
	self.on("slide_pageto", function(param, packet) {
		console.log(param);
		if (packet.from.granted == true) {
			self.send(packet.type, param);
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
