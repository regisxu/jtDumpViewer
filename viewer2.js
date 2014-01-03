function paint(dump) {
	var html = htmlize(dump);
	var list = document.createElement("div");
	list.innerHTML = html;

	var ps = list.getElementsByTagName("p");
	var thread;
	var stacks;
	var isStack = false;
	var nl = document.createElement("div");
	nl.setAttribute("id", "dump");

	for (var i = 0; i < ps.length; ++i) {
		if (isThreadHeader(ps[i])) {
			thread = document.createElement("div");
			thread.setAttribute("id", oid(ps[i]));
			thread.setAttribute("class", "thread");
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
		} else {
			nl.appendChild(ps[i].cloneNode());
		}
	}

	var types = ["oid", "tname", "daemon", "prio", "tid", "nid", "state", "method", "mdesc", "class"];
	var searchable = ["oid", "daemon", "prio", "state", "method", "class"];

	var color = d3.scale.category10().domain(types);

	for (var j = 0; j < types.length; ++j) {
		var type = types[j];
		var spans = nl.querySelectorAll("span." + type);
		loop(spans, function(span) { span.style.color = color(type); });
		if (isSearchable(searchable, type)) {
			loop(spans,
				 function(span) {
					 span.setAttribute("onclick", "searchSpan(this)");
					 span.style.cursor = "pointer";
				 }
				);
		}
	}

	if (document.getElementById("dump") != null) {
		document.body.removeChild(document.getElementById("dump"));
	}

	document.body.appendChild(nl);

}

function isSearchable(searchable, type) {
	return ploop(searchable, function(d) { return d == type; });
}

function isThreadHeader(p) {
	return p.querySelector("span.tname") != null;
}

function tname(p) {
	return p.querySelector("span.tname");
}

function oid(p) {
	var span = p.querySelector("span.oid");
	if (span != null) {
		return span.textContent;
	}
	return "";
}

function isState(p) {
	return p.querySelector("span.state") != null;
}

function toggleHidden(n) {
	var parent = n.parentNode.parentNode;
	var stacks = parent.querySelector(".stacks");
	if (stacks != null) {
		stacks.style.display == "none" ? stacks.style.display = "" : stacks.style.display = "none";
	}
}

document.getElementById("fpath").addEventListener("keypress", function(event) { if(event.keyCode != 13) { return; }; paint(readFile(event)); document.getElementById("tdump").value = "";}, false);
document.getElementById("tdump").addEventListener("keypress", function(event) { if(event.keyCode != 13) { return; }; paint(event.target.value); document.getElementById("fpath").value = "";}, false);

function readFile(event) {
	if (event.target.value == null || event.target.value.trim() == "") {
		return;
	}
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", event.target.value, false);
    rawFile.send(null);
	if(rawFile.status === 200 || rawFile.status == 0) {
        return rawFile.responseText;
    }
}

function searchSpan(span) {
	if(span.getAttribute("class") != null) {
		show(function(thread) { return search(thread, span.getAttribute("class"), span.textContent); });
	}
}

function show(select) {
	loop(document.querySelectorAll(".thread"),
		 function(thread) { thread.style.display = (select(thread) ? "" : "none"); }
		);
}

function search(thread, type, value) {
	return ploop(thread.querySelectorAll("span." + type),
				 function(span) { return span.textContent == value }
				);
}

function loop(list, f) {
	for (var i = 0; i < list.length; ++i) {
		f(list[i]);
	}
}

function ploop(list, p) {
	for (var i = 0; i < list.length; ++i) {
		if (p(list[i])) {
			return true;
		}
	}
	return false;
}
