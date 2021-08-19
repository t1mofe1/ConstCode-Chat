window.socket = io();

socket.on('error', alert);
socket.once('chats', setChats);

const app = document.querySelector('#app');

window.currentTemplate = '';
window.showTemplate = (name) => {
	const oldTemplate = window.templates[window.currentTemplate];
	if (oldTemplate && oldTemplate.terminate) oldTemplate.terminate();

	const newTemplate = window.templates[name];
	if (!newTemplate) return console.error('Wrong template name');
	window.currentTemplate = name;
	app.innerHTML = '';
	app.append(newTemplate.html);
	if (newTemplate.init) newTemplate.init();
};

showTemplate('login');
