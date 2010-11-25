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
		
		var name = null;
		var refleshId = null;
		var slides = [];
		var current = {
			page: -1,
			index: -1
		};

		$(expr).css({
			position: "relative"
		});
		var $viewPort = $("<div></div>");
		var $touchPad = $("<div></div>");
		$touchPad.css({
			position: "absolute", left: 0, top: 0,
			width: "100%", height: "100%", zIndex:9999,
			backgroundRepeat: "no-repeat",
			backgroundPosition: "right top"
		})
		$(expr).append($viewPort);
		$(expr).append($touchPad);
		
		nylon.client.on("core_pageto", function(param) {
			if (refleshId != null) clearInterval(refleshId);
			
			var next = {
				page: Number(param.page), index: Number(param.index)
			};
			
			// display up loader image
			$touchPad.css("background-image", "url('/objects/core/loader.gif')");
			
			if (current.page != next.page){
				current.page = next.page;
				current.index = -1;
				$viewPort.children().remove();
			}
			
			refleshId = setTimeout(function() {
				var callee = arguments.callee;
				
				var action = slides[current.page].actions[current.index + 1];
				
				if (!action || current.index == next.index) {
					$touchPad.css("background-image", "url('/objects/core/spacer.gif')");
					return;
				} else {
					current.index++;
				}
				
				
				switch (action.type) {
					case "svg":
						libsvg.load(BASE_URL + name + "/" + action.src, function(svg) {
						
							svg.setAttribute("width", "100%");
							svg.setAttribute("height", "100%");
							
							var $viewer = $("<div></div>");
							$viewer.addClass("page");
							$viewer.css({
								width: "100%", height: "100%",
								position: "absolute", left: 0, top: 0
							});
							if (current.index == 0) $viewer.css("background-color", "white");
							$touchPad.text(current.page +"/"+ current.index);
							$viewer.append(svg);
							$viewPort.append($viewer);
							callee();
						});
					break;
				}
			}, 0);
		});
		
		$touchPad.click(function() {
			if (slides[current.page] == undefined) return;
			var next = {
				page: current.page, index: current.index
			};

			if (slides[current.page].actions[current.index + 1] == undefined) {
				next.page = (current.page + 1) % slides.length;
				next.index = 0;
			} else {
				next.index++;
			}
			
			nylon.client.send("core_pageto", next);
		});
		
		$.ajax({
			url: BASE_URL + "denki.json",
			type: "GET",
			dataType: "json",
			success: function(obj) {
				name = obj.meta.name;
				slides = obj.slide;
				nylon.client.send("core_init");
			},
		});
	};
	
	exports.create = function(expr) {
		return new exports.Module(expr);
	};
	
	return exports;
})();
