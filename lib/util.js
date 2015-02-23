var fs = require("fs");

module.exports.toSize = function( buffer ) {
  var sizes = "KiB/MiB/GiB/TiB".split("/");
  var length = buffer.length | buffer;
  var unit = "B";
  while(length > 1024) {
    unit = sizes.shift();
    length = length/1024;
  }
  return require("util").format("%d %s", length.toFixed(1), unit);
};

// function to calculate EAN / UPC checkdigit
module.exports.eanCheckDigit = function(s)
{
	var result = 0;
	var rs = s.split("").reverse().join("");
	for (counter = 0; counter < rs.length; counter++)
	{
		result = result + parseInt(rs.charAt(counter)) * Math.pow(3, ((counter+1) % 2));
	}
	return (10 - (result % 10)) % 10;
};

module.exports.log = function() {
  doing("");
  var args = Array.prototype.slice.call(arguments);
  console.log( (args[0] ) ? "EMIL@" + args.join(" ") : "");
}

module.exports.doing = function() {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  var args = Array.prototype.slice.call(arguments);
  process.stdout.write( (args[0] ) ? "EMIL@WORK " + args.join(" ") : "");
}

