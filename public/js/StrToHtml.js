function StringToHTML(str) {
	let html = document.createElement('div');
	html.innerHTML = str;
	html = html.children[0];
	return html;
}
