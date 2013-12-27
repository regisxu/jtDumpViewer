var html = htmlize(document.getElementsByTagName("p")[0].textContent);
var list = document.getElementById("list");
list.innerHTML = html;

var ps = list.getElementsByTagName("p");
var thread;
var stacks;
var isStack = false;
var nl = document.createElement("div");
nl.setAttribute("id", "list");

for (var i = 0; i < ps.length; ++i) {
	if (isThreadHeader(ps[i])) {
		thread = document.createElement("div");
		thread.setAttribute("id", oid(ps[i]));
		var tn = ps[i].cloneNode();
		thread.appendChild(tn);
		tname(tn).setAttribute("onclick", "toggleHidden(this)");
		nl.appendChild(thread);
	} else if (isState(ps[i])) {
		stacks = document.createElement("div");
		stacks.setAttribute("class", "stacks");
		thread.appendChild(stacks);

		stacks.appendChild(ps[i].cloneNode());
		isStack = true;
	} else if (isStack) {
		stacks.appendChild(ps[i].cloneNode());
	}
}

var parent = list.parentNode;
parent.removeChild(list);
parent.appendChild(nl);

function isThreadHeader(p) {
	var spans = p.getElementsByTagName("span");
	for (var i = 0; i < spans.length; ++i) {
		if (spans[i].getAttribute("class") == "tname") {
			return true;
		}
	}
	return false;
}

function tname(p) {
	var spans = p.getElementsByTagName("span");
	for (var i = 0; i < spans.length; ++i) {
		if (spans[i].getAttribute("class") == "tname") {
			return spans[i];
		}
	}
	return "";
}

function oid(p) {
	var spans = p.getElementsByTagName("span");
	for (var i = 0; i < spans.length; ++i) {
		if (spans[i].getAttribute("class") == "oid") {
			return spans[i].textContent;
		}
	}
	return "";
}

function isState(p) {
	var spans = p.getElementsByTagName("span");
	for (var i = 0; i < spans.length; ++i) {
		if (spans[i].getAttribute("class") == "state") {
			return true;
		}
	}
	return false;	
}

function toggleHidden(n) {
	var parent = n.parentNode.parentNode;

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
