/* initialize function */
/*$(function() {
	if (!$.browser.mozilla) return;
	
	var depth = 200;
	
	//全imgタグを調べる
	var svgs = $("img").each(function(i, img) {
		var $img = $(img);
		var src = $img.attr("src");
		
		if (!/.svg$/.test(src)) {
			return;
		}

		// SVGのロード．ロード完了時にcallbackが呼ばれる
		libsvg.load(src, function(svg) {
			var $val = $("<div></div>");
			$val.attr("width", svg.getAttribute("width") || 320);
			$val.attr("height", svg.getAttribute("height") || 240);
			
			svg.setAttribute("width", "100%");
			svg.setAttribute("height", "100%");
			
			// 画像div枠右下のリサイズハンドル
			var resize = document.createElement("img");
			$(resize).attr("src", "xf_resize_icon.gif").attr("class", "resize");

			// 画像div枠の設定
			$val.append(svg);
			$img.after($val);
			$img.remove();
		});
	});
});*/

var libsvg = (function() {
	var IE    = /*@cc_on!@*/false,
		NS_URI = "http://www.w3.org/2000/svg";
		
	return {
		// load メソッド
		// URL文字列とcallback関数を受け取り，
		// XMLHttpRequestを用いて外部からSVGをロードする
		load: function(url, callback) {
			$.ajax({
				type: "GET",
				url: url,
				dataType: IE && "text" || "xml",
				
				success: function(xml) {
					var svg, width, height, viewBox;
					var dir = url.split("/").slice(0,-1).join("/")+"/";
					
					if (IE) {
						// IE9用の処理。バッドノウハウ
						var wrap = document.createElement("div");
						xml = xml.match(new RegExp("<svg[\\W\\w]*</svg>","i")).toString();
						wrap.innerHTML = xml.replace(/(xlink:href=\")(.+\..+)(\")/i, function(match, left, path, right) {
							return left + dir + path + right;
						});
						svg = wrap.firstChild;
					} else {
						// 他SVG対応ブラウザ向け処理。ここがミソ
						var rawSvg = xml.getElementsByTagName("svg")[0];
						rawSvg.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:base", dir);
						svg = document.importNode(rawSvg, true);
					}
					
					// width と heightを取得(単位無視=比率が合ってればいい)
					width = svg.getAttribute("width").match(/[0-9]+/);
					height = svg.getAttribute("height").match(/[0-9]+/);
					
					// 必要に応じてviewBoxを設定(拡大縮小時に痛いことになるため)
					viewBox = svg.getAttribute("viewBox");
					if (!viewBox) {
						svg.setAttribute("viewBox", "0 0 "+width+" "+height);
					}
					
					callback(svg);
				}
			});
		}
	};
})();

