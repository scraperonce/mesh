var fs = require("fs");

var dir = process.argv[2].toString().split("/").join("");

var slides = fs.readdirSync(dir || "./").filter(function(item) {
	return /.svg$/.test(item);
}).sort();

while(slides.length) {
	var slidePath = slides.shift();
	var path = "./"+dir+"/"+slidePath;

	var xml = fs.readFileSync(path).toString();
	
	// fixing
	xml = xml.replace(/(xlink:href=\")(.+)\.svg(\")/i, function(match, left, path, right) {
		return left + path + ".gif" + right;
	});
	
	fs.writeFileSync(path, xml);
}
