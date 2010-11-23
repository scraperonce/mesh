var fs = require("fs");

function extractIndex(n) {
	return n.match(/\d+\-\d+/).toString().split("-").map(function(item) {
		return Number(item);
	});
}

var slides = fs.readdirSync(process.argv[2] || "./").filter(function(item) {
	return /.svg$/.test(item);
}).sort();

var json = {
	meta: {
		name: "slide",
		title: "課題"
	},
	slide: []
};

while(slides.length) {
	var slide = slides.shift();
	var key = extractIndex(slide);
	var page = key[0]-1;
	var index = key[1]-1;

	if (!json.slide[page]) {
		json.slide[page] = {
			type: "slide",
			actions: []
		};
	}

	if (!json.slide[page].actions[index]) {
		json.slide[page].actions[index] = {
			type: "svg",
			src: slide
		};
	}
}

console.log(json);

fs.writeFileSync("out.json", JSON.stringify(json), "utf8");
