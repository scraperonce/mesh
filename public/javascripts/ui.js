/**
 * ui.js
 */

window.ui = {
	version: "0.2"
};

ui.toast = function(str, option) {
	var $div = $("<div></div>");
	$div.addClass("ui_toast");
	$div.hide();
	$div.html(str);
	
	$("body").append($div);
	$div.fadeIn();
	var positionId = setInterval(function() {
		$div.css("top", $(window).scrollTop()+20+"px");
	}, 10);
	setTimeout(function() {
		clearInterval(positionId);
		$div.fadeOut(function() {
			$div.remove();
		});
	}, 5000);
};

 
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

