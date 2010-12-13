/*!
 * slide example
 */
(function() {
var nylon = require("../lib/nylon");
var app = require("../init");
var sys = require("sys");
var fs = require("fs");

function Module() {
	// inherit
	nylon.Module.call(this);
	
	this.id = "slide";
	
	// prepare
	var self = this;

	// private properties
	var slidePage = 0;
	var slideName = null;
	var slideList = [];
	// private methods
	
	// Definition
	
	var listing = function(lines, fn) {
		if (lines.length == 0) {
			slideList = list;
			return fn(list);
		}
		
		var callee = arguments.callee;
		var name = lines.shift();
		
		fs.readFile(dirpath + name + "/slide.json", function(err, json) {
			if (!err) {	
				var obj = JSON.parse(json);
				
				list.push({
					name: name, title: obj.title
				});
			}
			callee();
		});
	};
	
	// Initialize
	
	self.on("slide_getlist", function(param, packet) {
		var dirpath = app.__dirname + "/public/objects/slide/";
		
		if (packet.from.granted == true) {
			fs.readFile(dirpath + "lists.txt", "utf8", function(err, data) {
				if (err) return self.send(packet.type, {err: "Internal Error"}, packet.from.name);
				
				var list = [];
				var lines = data.split("\n");
				
				listing(function() {
					self.send(packet.type, {
						list: list
					});
				});
			});
		}
	});
	
	self.on("slide_load", function(param, packet) {
		slideName = param.name;
		
		if (packet.from.granted == true) {
			slidePage = 0;
			
			var dirpath = app.__dirname + "/public/objects/slide/";
			fs.readFile(dirpath + slideName + "/slide.json", "utf8", function(err, json) {
				if (err) {
					self.send(packet.type, {err: "Failed to open slide"});
				} else {
					var obj = JSON.parse(json);
					
					self.queue(packet.type, {
						name: slideName,
						title: obj.title,
						length: obj.length
					});
				}
			});
		}
	});
	
	self.on("slide_pageto", function(param, packet) {
		if (packet.from.granted == true) {
			if (isNaN(Number(param.page))) {
				return;
			}
			
			slidePage = param.page;
			self.queue(packet.type, {
				page: slidePage
			});
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
