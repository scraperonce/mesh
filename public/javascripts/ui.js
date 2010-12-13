/**
 * ui.js
 */

window.ui = {
	version: "0.2"
};

ui.toast = (function() {
	var count = 0;
	var array = [];
	return function(str, option) {
		array.();
		var $div = $("<div></div>");
		$div.addClass("ui_toast");
		$div.hide();
		$div.html(str);
		
		$("body").append($div);
		$div.fadeIn();
		var positionId = setInterval(function() {
			var height = $div.height();
			$div.css("top", $(window).scrollTop() + 20 + id * height + "px");
		}, 10);
		setTimeout(function() {
			clearInterval(positionId);
			$div.fadeOut(function() {
				$div.remove();
				count--;
				id--;
			});
		}, 5000);
	};
})();
 
// shrinky box
$(function() {
	$(".shrinkey").each(function() {
		var $handle = $(this).children(".handle");
		var $bros = $handle.nextAll();
		var $div = $("<div></div>");
		$div.append($bros);
		$(this).append($div);
		$handle.click(function() {
			$div.animate({height: "toggle"},"fast");
		});
	});
});

