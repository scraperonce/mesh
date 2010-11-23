(function() {
	var exports = {};
	
	exports.Module = function(expr) {
		var self = this;
		
		// public method
		self.load = function(path) {
			nylon.client.send("core_load", {
				path: path
			});
		}
		
		// Initialize
		var BASE_URL = "/objects/core/";
		
		var slideArray = [];
		var page = 0;
		
		var $slide = $(expr);
		var $image = $("<img></img>");
		$image.css({width: "100%", height: "100%"});
		$slide.append($image);
		
		nylon.client.on("core_pageto", function(param) {
			page = param.index;
			if (slideArray[param.index])
				$image.attr("src", slideArray[param.index].src);
		});
		
		nylon.client.on("core_clear", function() {
			$image.attr("src", "");
		});
		
		$slide.click(function() {
			nylon.client.send("core_pageto", {
				index: ++page % slideArray.length
			});
		});
		
		$slide.mousedown(function() {
			var id = setTimeout(function() {
				alert("消します！");
				nylon.client.send("core_clear");
			}, 3000);

			$slide.one("mouseup", function() {
				clearTimeout(id);
			});
		});
		
		$.ajax({
			url: BASE_URL + "slide.json",
			type: "GET",
			dataType: "json",
			success: function(obj) {
				slideArray = obj.slide;
				for (var i=0, len=slideArray.length; i<len; i++) {
					slideArray[i].src = BASE_URL + obj.meta.name + "/" + slideArray[i].src; 
				}
				
				nylon.client.emit("core_pageto", {
					index: page
				});
			},
		});
		
	};
	
	exports.create = function(expr) {
		return new exports.Module(expr);
	};
	
	return exports;
})();
