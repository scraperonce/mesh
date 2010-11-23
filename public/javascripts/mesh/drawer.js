(function() {
	var exports = {};
	
	exports.Module = function(expr) {
		var $div = $(expr);
		var penStore = {};
		
		var $canvas = $("<canvas></canvas>");
		$canvas.attr({width: $div.width(), height: $div.height()});
		$div.append($canvas);
		
		var color = [
			"blue", "red", "black", "gray"
		][parseInt(Math.random()*4)];
		var ctx = $canvas.get(0).getContext("2d");
		
		nylon.client.on("drawer_draw", function(param) {
			ctx.fillStyle = penStore[param.from].color;
			ctx.fillRect(param.x, param.y, 10, 10);
		});
		
		nylon.client.on("drawer_color", function(param) {
			if (!penStore[param.from]) {
				penStore[param.from] = {};
			}
			penStore[param.from].color = param.color;
		});
		
		// Initialize (Drawing)
		var ctx = $canvas.get(0).getContext("2d");
		var dragged = false;
		$canvas.mousedown(function() {
			dragged = true;
		});
		$canvas.mouseup(function() {
			dragged = false;
		});
		$canvas.mousemove(function(event) {
			if (dragged) {
				var offset = $canvas.offset();
				nylon.client.send("drawer_draw", {
					x: parseInt(event.pageX - offset.left),
					y: parseInt(event.pageY - offset.top)
				});
			}
		});
		
		nylon.client.send("drawer_color", {
			color: color
		});
	};
	
	return exports;
})();