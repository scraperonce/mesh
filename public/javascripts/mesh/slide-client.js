(function() {
	var exports = {};
	
	exports.Module = function(expr) {
		var client = nylon.client;
		
		// Definitions
		
		var BASE_URL = "/objects/slide/";
		
		var name, title;	//:String
		var length, page;	//:Number(Integer)
		
		var $view, $img;	//:jQueryObject
		
		var $view = $(expr);
		var $img = $(new Image());
		$img.attr("src", BASE_URL + "spacer.png");
		$img.css({width: "100%", height: "100%"});
		
		// Initialize
		
		$view.append($img);
		
		
		// Listening
		
		client.on("slide_load", function(param) {
			// Loading slide.json
			name = param.name;
			
			$.ajax({
				url: BASE_URL + name + "/slide.json",
				type: "GET",
				dataType: "json",
				success: function(obj) {
					title = obj.title;
					length = obj.length;
					for (var i=0; i<length; i++) {
						new Image().src = BASE_URL + name + "/" + i + ".jpg";
					}
					ui.toast("スライド \"" + title + "\" を読み込みました");
					client.send("slide_pageto", {
						page: 0
					});
				},
				error: function() {
					alert("スライドの読み込みに失敗しました");
				}
			});
		});
		
		client.on("slide_pageto", function(param) {
			page = Number(param.page);
			$img.attr("src", BASE_URL + name + "/" + page + ".jpg");
		});
		
		$view.click(function() {
			if (length == undefined) {
				var name = prompt("スライド名を入力してください");
				console.log(name);
				if (name && name.length) {
					client.send("slide_load", {
						name: name
					});
				}
			} else {
				
				client.send("slide_pageto", {
					page: page+1
				});
			}
		});
		
	};
	
	exports.create = function(expr) {
		return new exports.Module(expr);
	};
	
	return exports;
})();
