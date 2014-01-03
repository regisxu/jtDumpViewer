function htmlize(dump) {
	var lines = dump.split("\n");
	var context = {};
	var html = "";
	context.parser = parseHeader;
	context.html = "";
	for (var i = 0; i < lines.length; ++i) {
		context.parser = context.parser(context, trim(lines[i]));
		html += p(null, convertHeadingSpace(context.html)) + "\n";
	}

	return html;
}

function trim(line) {
	var count = 0;
	for (var i = line.length - 1; i >= 0; --i) {
		if (line[i] == "\r") {
			count += 1;
		}
	}
	return line.substr(0, line.length - count);
}

function convertHeadingSpace(str) {
	var result = "";
	for (var i = 0; i < str.length; ++i) {
		if (str[i] == " ") {
			result += "&nbsp;"
		} else if (str[i] == "\t") {
			result += "&nbsp;&nbsp;&nbsp;&nbsp;";
		} else {
			result += str.substring(i, str.length);
			break;
		}
	}
	return result;
}

function parseHeader(context, line) {
	if (!isHeader(line)) {
		context.html = line;
		return parseHeader;
	}	
	var htmlize = htmlizer(line);
	context.html = htmlize.between("\"").span("tname").split(" ", function(value) {
		if (value == "daemon") {
			return span("daemon", value);
		}
		if (value.indexOf("=") != -1) {
			var values = value.split("=");
			return values[0] + "=" + span(values[0], values[1]);
		}
		if (value.indexOf("[") == 0) {
			return value[0] + span("oid", value.substr(1, value.length - 2)) + value[value.length - 1];
		}
		return value;
	}).result;
	return parseState;
}

function parseState(context, line) {
	if (line.trim() == "") {
		context.html = line;
		return parseHeader;
	}
	var htmlize = htmlizer(line);
	if (line.indexOf("(") != -1) {
		context.html = htmlize.until(":").text().between(" ").span("state").end().text().result;
	} else {
		context.html = htmlize.until(": ").text().end().span("state").result;
	}
	return parseTrace;
}

function parseTrace(context, line) {
	if (line.trim() == "") {
		context.html = line;
		return parseLocks;
	}

	if (line.indexOf("at ") != -1) {
		var htmlize = htmlizer(line);
		context.html = htmlize
			.until("at ").text()
			.until("(").span("method")
			.until(")").span("mdesc")
			.end().text()
			.result;
	} else if (line.indexOf("- None") != -1) {
		context.html = line;
	} else if (line.trim().indexOf("- ") == 0) {
		var htmlize = htmlizer(line);
		context.html = htmlize
			.between("<", ">").span("oid")
			.until("(a ").text()
			.until(")").span("class")
			.end().text()
			.result;
	} else {
		context.html = line;
	}

	return parseTrace;
}

function parseLocks(context, line) {
	context.html = line;
	return parseLock;
}

function parseLock(context, line) {
	if (line.trim() == "") {
		context.html = line;
		return parseHeader;
	}
	if (line.indexOf("- None") != -1) {
		context.html = line;
		return parseLock;
	}

	var htmlize = htmlizer(line);
	context.html = htmlize
		.until("- ").text()
		.between("<", ">").span("oid")
		.until("(a ").text()
		.until(")").span("class")
		.end().text()
		.result;

	return parseLock;
}

function isHeader(line) {
	return line.trim()[0] == "\"";
}


function span(key, value) {
	return element("span", key, value);
}

function p(key, value) {
	return element("p", key, value);
}

function element(element, key, value) {
	if (key == null) {
		return "<" + element + ">" + value + "</" + element + ">";
	}
	return "<" + element + " class=\"" + key + "\">" + value + "</" + element + ">";
}

function htmlizer(dump) {
	var htmlize = {};
	htmlize.token = "";
	htmlize.result = "";
	htmlize.index = 0;

	htmlize.between = function(start, end, include) {
		if (end == null || end == "") {
			end = start;
		}
		if (include == null) {
			include = false;
		}
		return htmlize.until(start, include).text().until(end, include);
	};

	htmlize.end = function() {
		htmlize.token = dump.substring(htmlize.index, dump.length);
		htmlize.index = dump.length;
		htmlize.delimiter = "";
		return htmlize;
	}

	htmlize.until = function(delimiter, include) {
		if (include == null) {
			include = false;
		}
		var i = dump.indexOf(delimiter, htmlize.index);
		if (i == -1) {
			htmlize.token = "";
			return htmlize;
		}

		if (include) {
			i += delimiter.length;
			htmlize.token = dump.substring(htmlize.index, i);
			htmlize.index = i;
			htmlize.delimiter = "";
		} else {
			htmlize.token = dump.substring(htmlize.index, i);
			htmlize.index = i + delimiter.length;
			htmlize.delimiter = delimiter;
		}
		return htmlize;
	};

	htmlize.split = function(separator, f) {
		var i = -1;
		while (htmlize.index != i) {
			i = htmlize.index;
			htmlize.until(separator).htmlize(f);
		}
		return htmlize.end().htmlize(f);
	}

	htmlize.text = function() {
		htmlize.result += htmlize.token + htmlize.delimiter;
		return htmlize;
	}

	htmlize.p = function(key) {
		return htmlize.htmlize(function (value) {
			return p(key, value);
		});
	}

	htmlize.span = function(key) {
		return htmlize.htmlize(function (value) {
			return span(key, value);
		});
	}

	htmlize.htmlize = function(f) {
		htmlize.result += f(htmlize.token) + htmlize.delimiter;
		return htmlize;
	}

	return htmlize;
}
