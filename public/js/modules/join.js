{
	/* ============== HTML ============== */
	const html = StringToHTML(`
		<div class="center">
			<div class="form">
				<div class="form_title">Присоединиться</div>
				<div class="form_group">
					<div class="form_label">Название:</div>
					<input type="text" class="input" />
					<div class="subtitle subtitle-right subtitle_group">Оставьте пустым для входа в главный чат</div>
				</div>
				<div class="form_group">
					<div class="form_label">Пароль:</div>
					<input type="password" class="input" />
				</div>
				<button class="action">Присоединиться</button>

				<ul class="chat-list">
				</ul>
			</div>
		</div>`);
	/* =============== JS =============== */
	function createListItem(item) {
		const li = StringToHTML(`
			<li class="chat-item">
				<span class="lock${item.locked ? '' : '-none'}"></span><span>(${item.counter})</span>
				<span>${item.title}</span>
			</li>`);

		li.addEventListener('click', () => (html.querySelector('input[type="text"]').value = item.title));

		return li;
	}

	function showChats() {
		const ul = html.querySelector('.chat-list');

		ul.innerHTML = '';

		getChats().forEach((chat) => {
			ul.appendChild(createListItem(chat));
		});
	}

	function init() {
		socket.on('join', joinHandler);
		socket.on('chats', (chats) => {
			setChats(chats);
			showChats();
		});

		showChats();
	}

	function terminate() {
		socket.off('join', joinHandler);
		socket.off('chats', setChats);
	}

	function joinHandler() {
		window.showTemplate('chat');
	}

	html.querySelector('button').addEventListener('click', () => {
		const roomName = html.querySelector('input[type="text"]').value.trim();
		const roomPass = html.querySelector('input[type="password"]').value.trim();

		socket.emit('join', roomName, roomPass);
	});
	/* ================================== */

	/* ========= EXPORTING HTML ========= */
	window.templates['join'] = { init, terminate, html };
	/* ================================== */
}
