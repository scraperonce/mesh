(function() {
	var exports = {};
	
	exports.Module = function(expr) {
		var client = nylon.client;
		
		// Definitions
		
		var BASE_URL = "/objects/slide/";
		
		// Properties
		self.name = null;
		self.title = null;
		self.page = null;
		self.length = 0;
		
		var $view, $img;	//:jQueryObject
		
		var $view = $(expr);
		var $img = $(new Image());
		$img.attr("src", BASE_URL + "spacer.png");
		$img.css({width: "100%", height: "100%"});
		
		// Initialize
		
		$view.append($img);
		
		
		// Listening
		
		client.on("slide_load", function(param) {
			if (param.err) {
				return ui.toast("スライドの読み込みに失敗しました");
			}
			
			self.name = param.name;
			self.title = param.title;
			self.length = param.length;
			
			ui.toast("スライド \"" + title + "\" を読み込みました");
			
			for (var i=0; i<length; i++) {
				new Image().src = BASE_URL + name + "/" + i + ".jpg";
			}
			$img.attr("src", BASE_URL + self.name + "/0.jpg");
		});
		
		client.on("slide_pageto", function(param) {
			self.page = Number(param.page);
			if (self.page >= self.length) {
				self.page = self.length - 1;
			} else if (page < 0) {
				self.page = 0;
			}
			$img.attr("src", BASE_URL + self.name + "/" + self.page + ".jpg");
		});
		
		// Event Handling
		
		var pageto = function(page) {
			if (!length) {
				var name = prompt("スライド名を入力してください");
				if (name && name.length) {
					client.send("slide_load", {
						name: name
					});
				}
			} else {
				client.send("slide_pageto", {
					page: page
				});
			}
		};
		
		$(window).keydown(function(e) {
			var key = e.keyCode;
			if (key == 39) { // Right Arrow
				pageto(self.page+1);
			} else if (key == 37) { // Left Arrow
				pageto(self.page-1);
			} else if (key == 13) { // Enter
				pageto(self.page+1);
			}
			return true;
		});
		
		$view.click(function() {
			pageto(self.page+1);
		});
	};
	
	exports.create = function(expr) {
		return new exports.Module(expr);
	};
	
	return exports;
})();
