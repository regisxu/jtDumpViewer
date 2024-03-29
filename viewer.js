var types = ["oid", "tname", "daemon", "prio", "tid", "nid", "state", "method", "mdesc", "class"];
var searchable = ["oid", "daemon", "prio", "state", "method", "class"];

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

    if (document.getElementById("dump") != null) {
        document.body.removeChild(document.getElementById("dump"));
    }    

    document.body.appendChild(nl);

    var color = d3.scale.category10().domain(types);

    d3.selectAll("#dump span").style("color",
                                     function(d) {
                                         return color(this.getAttribute("class"));
                                     })
                              .style("cursor",
                                     function(d) {
                                         return isSearchable(searchable, this.getAttribute("class")) ? "pointer" : null;
                                     })
                              .attr("onclick",
                                    function(d) {
                                        return isSearchable(searchable, this.getAttribute("class")) ? "searchSpan(this)" : null;
                                    });

    d3.selectAll("#dump span.tname").attr("onclick", "toggleHidden(this)");
}

function isSearchable(searchable, type) {
    return ploop(searchable, function(d) { return d == type; });
}

function isThreadHeader(p) {
    return p.querySelector("span.tname") != null;
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

document.getElementById("fpath").addEventListener("keypress",
                                                  function(event) {
                                                      if(event.keyCode != 13) {
                                                          return;
                                                      }
                                                      paint(readFile(event));
                                                      document.getElementById("tdump").value = "";
                                                  },
                                                  false);

document.getElementById("tdump").addEventListener("keypress",
                                                  function(event) {
                                                      if(event.keyCode != 13) {
                                                          return;
                                                      }
                                                      paint(event.target.value);
                                                      document.getElementById("fpath").value = "";
                                                  },
                                                  false);

document.getElementById("search").addEventListener("keyup", function(event) { searchText(this.value); });

function search(txt) {
    if (txt.split(":").length == 2) {
        var kv = txt.split(":");
        searchPair(kv[0], kv[1]);
    } else {
        searchText(txt);
    }
}

function searchText(txt) {
    show(function(thread) {
        return ploop(thread.querySelectorAll("p"),
                     function(p) {
                         return p.textContent.toLowerCase().indexOf(txt.toLowerCase()) != -1;
                     });
    });
}

function searchPair(type, value) {
    show(function(thread) {
        return ploop(thread.querySelectorAll("span." + type),
                     function(sp) {
                         return sp.textContent == value;
                     });
    });
}

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
        var s = document.getElementById("search");
        s.value = span.getAttribute("class") + ":" + span.textContent;
        search(s.value);
    }
}

function show(select) {
    loop(document.querySelectorAll(".thread"),
         function(thread) { thread.style.display = (select(thread) ? "" : "none"); }
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
