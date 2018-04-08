function start() {
	var input = document.getElementById("url");
	var url = localStorage["ocb_url"];
	if (url != null) {
		input.value = url;
	}
	input = document.getElementById("uname");
	url = localStorage["ocb_uname"];
	if (url != null) {
		input.value = url;
	}
	input = document.getElementById("pw");
	var url = localStorage["ocb_password"];
	if (url != null) {
		input.value = url;
	}
	var form = document.getElementById("form");
	form.addEventListener("submit", handleClick);
}

function handleClick(event) {
	var input = document.getElementById("url");
	var url = input.value;
	if (url[url.length - 1] != '/') {
		url = url + "/";
	}
	localStorage["ocb_url"] = url;
	input = document.getElementById("uname");
	localStorage["ocb_uname"] = input.value;
	input = document.getElementById("pw");
	localStorage["ocb_password"] = input.value;
	event.preventDefault();
}

document.addEventListener('DOMContentLoaded', start);

