var fs = require("fs");

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


