/**
 * home.js
 */

// program table
var tableIds = ["#lesson_table", "#log_table"];
$(function() {
	if (!tableIds.length) return;
	
	var id = tableIds.pop();
	var $trows = $(id + " tr:gt(0)");
	
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
		
	});
	$($trows.get(0)).click();
	arguments.callee();
});