(function() {
	var exports = {};
	
	exports.Module = function() {
		var self = this;

		// Initialize
		nylon.client.on("ecoco_connect", function(param) {
			ui.toast(param.name + "が接続しました。")
		});
		setTimeout(function() {
			nylon.client.send("ecoco_connect");
		}, 10);	
	};
	
	exports.create = function() {
		return new exports.Module();
	};
	
	return exports;
})();
