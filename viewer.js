var threads = parse(document.getElementsByTagName("p")[0].textContent);
var list = document.getElementById("list");
for (var i = 0; i < threads.length; ++i) {
	var thread = threads[i];
    var te = document.createElement("div");
	if (thread.id != null) {
		te.setAttribute("id", thread.id);
	}
	var name = document.createElement("span");
	name.setAttribute("class", "tname");
	name.setAttribute("name", thread.id);
	name.setAttribute("onclick", "toggleHidden(\"" + thread.id + "\")");
	te.appendChild(name);
	list.appendChild(te);
    var text = document.createTextNode(threads[i].name);
	name.appendChild(text);
	var stacks = document.createElement("div");
	stacks.setAttribute("class", "stacks");
	stacks.style.display = "none";
	te.appendChild(stacks);
	if (thread.stacks != null) {
		for (var j = 0; j < thread.stacks.length; ++j) {
			var stack = document.createElement("p");
			var value = document.createTextNode(thread.stacks[j]);
			stack.appendChild(value);
			stacks.appendChild(stack);
		}
	}
	te.appendChild(document.createElement("br"));
	te.appendChild(document.createElement("br"));
}

function toggleHidden(id) {
	var parent = document.getElementById(id);
	for (var i = 0; i < parent.childNodes.length; ++i) {
		var child = parent.childNodes[i];
		if (child.getAttribute("class") == "stacks") {
			if (child.style.display == "none") {
				child.style.display = "";
			} else {
				child.style.display = "none";
			}
			return;
		}
	}
}
