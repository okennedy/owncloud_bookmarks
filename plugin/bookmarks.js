var main_url;
var export_url = "index.php/apps/bookmarks/public/rest/v2/bookmark?page=-1";
var doc;
var favicon = "chrome://favicon/";
var config = "config.html";

function getFavIcon(url) {
	return favicon + url;
}

function blue(event) {
	return setBgColor(event.target, true);
}

function white(event) {
	return setBgColor(event.target, false);
}

function setBgColor(obj, on) {
	while (obj.tagName.toLowerCase() != "tr") {
		obj = obj.parentNode;
	}
	var color = 'white';
	if (on) {
		color = 'lightblue';
	}
	obj.style.backgroundColor = color;
	return obj;
}

function addSeparator(tr) {
	if (tr != null) {
		var children = tr.childNodes;
		for (var i = 0; i < children.length; ++i) {
			node = children.item(i);
			if (node.tagName.toLowerCase() == "td") {
				if (node.className.length != 0) {
					node.className += " ";
				}
				node.className += "sep";
			}
		}
	}
}

function displayBookmarks() {
	main_url = localStorage["ocb_url"];
	var uname = localStorage["ocb_uname"];
	var password = localStorage["ocb_password"];
	if (main_url == null || !main_url.length || uname == null || !uname.length) {
		showURL(config);
	}
	var myInit = {method: 'GET', headers: {'Authorization': 'Basic ' + btoa(uname + ':' + password)}, mode: 'cors', cache: 'default'};
	fetch(main_url + export_url, myInit).then(function(response) {
		if (response.ok) {
			return response.text();
		} else {
			showError(response.error());
		}
	}).then(function(myText) {
		doc = JSON.parse(myText);
		if (doc['status'] == 'error') {
			showError(doc['message']);
		} else {
			parseBookmarks();
		}
	});
}

function parseBookmarks() {
	var div = document.getElementById("towrite");
	var table = document.createElement("table");
	div.appendChild(table);
	var tr = document.createElement("tr");
	table.appendChild(tr);
	var td = document.createElement("td");
	tr.appendChild(td);
	div = document.createElement("div");
	div.id = "leftmenu";
	td.appendChild(div);
	div.className = "inner";
	table = document.createElement("table");
	div.appendChild(table);
	table.className = "inner";

	var add = createAddMenuItem(table);
	var lastLabel = getLabels(table);
	var woLab = getBookmarksWOLabels(table);
	if (woLab != null) {
		addSeparator(lastLabel);
	}
	if (woLab != null || lastLabel != null) {
		addSeparator(add);
	}

	td = document.createElement("td");
	tr.appendChild(td);
	div = document.createElement("div");
	td.appendChild(div);
	div.className = "inner";
	div.id = "submenu";
}

function localesort(str1, str2) {
	return str1.toLowerCase().localeCompare(str2.toLowerCase());
}

function getLabels(table) {
	var set = {};
	for (var i = 0; i < doc.data.length; ++i) {
		var labels = doc.data[i]['tags'];
		for (var j = 0; j < labels.length; ++j) {
			if (labels[j].length != 0) {
				set[labels[j]] = true;
			}
		}
	}
	var array = [];
	for (key in set) {
		array.push(key);
	}
	array = array.sort(localesort);
	var linesep = false;
	var ret = null;
	for (var i = 0; i < array.length; ++i) {
		if (i == array.length - 1) {
			linesep = true;
		}
		ret = menuItem(table, array[i], mouseDownLabelText, array[i], ">", linesep, "folder.png");
	}
	return ret;
}

function getBookmarksWOLabels(table) {
	var ret = null;
	for (var i = 0; i < doc.data.length; ++i) {
		var label = doc.data[i]['tags'];
		if (!label.length || (label.length == 1 && label[0].length == 0)) {
			var title = doc.data[i]['title'];
			var url = doc.data[i]['url'];
			if (!url.length) {
				continue;
			}
			ret = menuItem(table, title, mouseDownBookmarkText, url, "", false, getFavIcon(url));
		}
	}
	return ret;
}

function bookmarkSelectionLeft(event, par) {
	chrome.tabs.create({url:par});
	window.close();
}

function bookmarkSelectionMiddle(event, par) {
	if (event && event.button == 1) {
		chrome.tabs.create({url:par, active:false});
	}
}

function labelSelection(event, par) {
	obj = blue(event);
	var sm = document.getElementById("submenu");
	var lm = document.getElementById("leftmenu");
	var j = document.getElementById("subtable");
	if (j != null) {
		sm.removeChild(j);
	}
	sm.appendChild(createSubMenu(par));
	sm.style.position = 'relative';
	sm.style.top = '0px';	
	var offset = obj.offsetTop - lm.scrollTop;
	if (lm.offsetHeight < sm.offsetHeight + offset) {
		offset -= sm.offsetHeight + offset - lm.offsetHeight;
	}
	if (offset >= lm.offsetTop) {
		sm.style.top = '' + offset + 'px';
	}
}

function labelClicked(event, par) {
	var array = getBookmarksForLabel(par);

	for (var i = 0; i < array.length; ++i) {
		chrome.tabs.create({url: array[i].url});
	}
	window.close();
}

function pairSort(a, b) {
	return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
}

function getBookmarksForLabel(label) {
	var array = [];

	for (var i = 0; i < doc.data.length; ++i) {
		var labels = doc.data[i]['tags'];
		for (var j = 0; j < labels.length; ++j) {
			if (labels[j] == label) {
				var url = doc.data[i]['url'];
				if (!url.length) {
					continue;
				}
				var pair = {};
				pair.url = url;
				var title = doc.data[i]['title'];
				if (title.length) {
					pair.title = title;
				} else {
					pair.title = pair.url;
				}
				array.push(pair);
				break;
			}
		}
	}
	
	return array.sort(pairSort);
}

function createSubMenu(label) {
	var table = document.createElement("table");
	table.className = "inner";
	table.id = "subtable";

	var array = getBookmarksForLabel(label)

	for (var i = 0; i < array.length; ++i) {
		var tr = document.createElement("tr");
		tr.className = "inner";
		mouseDownBookmarkText(tr, array[i].url);
		tr.addEventListener("mouseout", white);

		var td = document.createElement("td");
		td.className = "img";
		var img = document.createElement("img");
		img.src = getFavIcon(array[i].url);
		td.appendChild(img);
		tr.appendChild(td);

		td = document.createElement("td");
		td.appendChild(document.createTextNode(array[i].title));
		tr.appendChild(td);

		table.appendChild(tr);
	}
	return table;
}

function mouseDownLabelText(item, par) {
	item.addEventListener("mouseover", function(event) {labelSelection(event, par)});
	item.addEventListener("click", function(event) {labelClicked(event, par)});
}

function mouseDownBookmarkText(item, par) {
	item.addEventListener("mouseover", blue);
	item.addEventListener("click", function(event) {bookmarkSelectionLeft(event, par)});
	item.addEventListener("mouseup", function(event) {bookmarkSelectionMiddle(event, par)});
}

function createAddMenuItem(table) {
	return menuItem(table, "Add Bookmark", mouseDownAddText, null, "", true, getFavIcon(main_url));
}

function mouseDownAddText(item, par) {
	item.addEventListener("mouseover", blue);
	item.addEventListener("click", addBookmark);
}

function menuItem(table, title, mousefunc, mouseparam, separator, lineseparator, imgsrc) {
	var tr = document.createElement("tr");
	tr.className = "inner";
	table.appendChild(tr);
	var td = document.createElement("td");
	tr.appendChild(td);
	td.className = "img";
	var img = document.createElement("img");
	td.appendChild(img);
	img.src = imgsrc;
	td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode(title));
	td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode(separator));
	mousefunc(tr, mouseparam);
	tr.addEventListener("mouseout", white);
	return tr;
}

function openAddWindow(url, title) {
	console.log("Open Add: "+title+" -> "+url);
	insert_url = (main_url + 
			'index.php/apps/bookmarks/bookmarklet?url=' + 
			encodeURIComponent(url) + 
			'&title=' + 
			encodeURIComponent(title));
	console.log(insert_url)
	chrome.tabs.create({ url: insert_url })
}

function addBookmark() {
	var callback = function(tab){
		// console.log(tab.url)
		// console.log(tab.title)
		openAddWindow(tab.url, tab.title)
	}

	chrome.tabs.query(
		{ active: true, currentWindow: true },
		function(tabList){ callback(tabList[0]) }
	)
}

function cleanNode(node) {
	var children = node.childNodes;
	for (var i = 0; i < children.length; ++i) {
		node.removeChild(children[i]);
	}	
}

function showURL(url) {
	bookmarkSelectionLeft(null,  url);
}

function showError(text) {
	var div = document.getElementById("towrite");
	cleanNode(div);
	var par = document.createElement("p");
	div.appendChild(par);
	var textNode = document.createTextNode(text);
	par.appendChild(textNode);
}

document.addEventListener('DOMContentLoaded', displayBookmarks);

