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
	var last = {
		page: 0, index: 0
	};
	
	// private methods
	
	// initialize
	self.on("core_init", function(param, packet) {
		if (packet.from.granted == true) {
			self.queue("core_pageto", last);
		}
	});
	
	self.on("core_pageto", function(param, packet) {
		if (packet.from.granted == true) {
			last.page = param.page;
			last.index = param.index;
			if (last.index == 0) {
				self.queue(packet.type, last);
			} else {
				self.send(packet.type, last);
			}
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
