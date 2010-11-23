/**
 * home.js
 */

// program lesson table 
$(function() {
	var $trows = $("#lesson_table tr:gt(0)");
	var $selected = $("#lesson_create .indicator");
	
	$trows.each(function() {
		var $radio = $(this).children("td").children("input:radio");
		
		$(this).css("cursor", "pointer");
		$(this).mouseover(function() {
			if (!$radio.get(0).checked)
				$(this).css("background", "#b6d180");
		});
		$(this).mouseout(function() {
			if (!$radio.get(0).checked)
				$(this).css("background", "inherit");
		});
		$(this).click(function() {
			$trows.css("background", "inherit");
			$(this).css("background", "#ecfaa0");
			$radio.get(0).click();
		});
		
		if (!$radio.get(0).checked)
			$(this).click();
	});
});