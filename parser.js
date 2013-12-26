
function parse(dump) {
	var lines = dump.split("\n");
	var context = {};

	context.threads = [];
	context.parser = parseHeader;

	for (var i = 0; i < lines.length; ++i) {
//		console.log(lines[i]);
		context.parser = context.parser(context, lines[i]);
	}

	return context.threads;
}

function isHeader(line) {
	return line.trim()[0] == "\"";
}

function parseHeader(context, line) {
	if (!isHeader(line)) {
		return parseHeader;
	}

	var thread = {};
	var name = line.match("\".*\"")[0];
	thread["name"] = name.substr(1, name.length - 2);
	line = line.replace(name, "").trim();

	var values = line.split(" ");
	var index = 0;

	if ("daemon" == values[index]) {
		thread["daemon"] = true;
		index++;
	} else {
		thread["daemon"] = false;
	}
	
	for (; index < values.length; ++index) {
		if (values[index].indexOf("=") != -1) {
			var kv = values[index].split("=");
			thread[kv[0]] = kv[1];
		} else if (values[index][0] == "[") {
			thread["id"] = values[index].substr(1, values[index].length - 2);
		}
	}

	context.threads.push(thread);
	return parseState;
}

function parseState(context, line) {
	if (line.trim() == "") {
		return parseHeader;
	}

	var values = line.split(":")[1].trim().split("(");
	var state = {};
	state.state = values[0].trim();
	if (values.length == 2) {
		state.desc = values[1].substr(0, values[1].length - 1).trim();
	}
	var thread = context.threads[context.threads.length - 1];
	thread.state = state;
	thread.stacks = [];
	return parseTrace;
}

function parseTrace(context, line) {
	if (line.trim() == "") {
		return parseLocks;
	}
	var thread = context.threads[context.threads.length - 1];
	thread.stacks.push(line.trim());
	return parseTrace;
}

function parseLocks(context, line) {
	var thread = context.threads[context.threads.length - 1];
	thread.locks = [];
	return parseLock;
}

function parseLock(context, line) {
	if (line.trim() == "") {
		return parseHeader;
	}

	var lock = {};
	var id = line.match("<.*>");
	if (id != null) {
		lock.id = id[0].substr(1, id[0].length - 2);
		var type = line.match(/\(.*\)/)[0].split(" ")[1];
		lock.type = type.substr(0, type.length - 1);
		var thread = context.threads[context.threads.length - 1];
		thread.locks.push(lock);
	}
	return parseLock;
}

