(function() {
	var exports = {};
	
	exports.Module = function(expr) {
		var self = this;
		var client = nylon.client;
		var events = [];
		// Initialize
		
		client.on("playback_load", function(param) {
			events = param.events;
		});
		
		client.on("playback_play", function(param) {
			var beginTime = param.beginTime;
			var elapsed = 0;
			var id = setInterval(function() {
				elapsed += 100;
				var packets = [], event;
				
				while(events.length) {
					event = events[0];
					
					if (elapsed < event.time) {
						break;
					}
					packets.push(events.shift().packet);
				}
				for (var i=0, len=packets.length; i<len; i++) {
					for (var j=0, size=packets[i].body.length; j<size; j++) {
						nylon.client.emit("receive", packets[i].body[j]);
					}
				}
				
				if (!events.length) {
					clearInterval(id);
				}
			}, 100);
		});
		
	};
	
	$(function() {
		$("#mesh_playback_load").click(function() {
			var id = Number(prompt("logのIDを入力してください"));
			
			if (isNaN(id)) return; 
			
			nylon.client.send("playback_load",{
				id: id
			});
		});
		$("#mesh_playback_play").click(function() { 
			nylon.client.send("playback_play");
		});
	});
	
	exports.create = function(expr) {
		return new exports.Module(expr);
	};
	
	return exports;
})();
