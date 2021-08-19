{
	/* ============== HTML ============== */
	const html = StringToHTML(`
		<div class="center">
			<div class="form">
				<div class="form_title">Создать чат</div>
				<div class="form_group">
					<div class="form_label">Название:</div>
					<input type="text" class="input" />
				</div>
				<div class="form_group">
					<div class="form_label">Пароль:</div>
					<input type="password" class="input" />
					<div class="subtitle subtitle-right subtitle_group">Оставьте пустым если вход свободный</div>
				</div>
				<div class="form_group">
					<div class="form_label">Публичный:</div>
					<input type="checkbox" class="input checkbox" />
				</div>
				<button class="action">Создать</button>
			</div>
		</div>`);
	/* ================================== */

	/* =============== JS =============== */
	function init() {
		socket.on('create', createHandler);
	}

	function terminate() {
		socket.off('create', createHandler);
	}

	function createHandler() {
		window.showTemplate('chat');
	}

	html.querySelector('button').addEventListener('click', () => {
		const roomName = html.querySelector('input[type="text"]').value.trim();
		const roomPass = html.querySelector('input[type="password"]').value.trim();
		const roomIsPublic = html.querySelector('input[type="checkbox"]').checked;

		if (roomName.length < 1 || roomName.length > 16) {
			return alert('Длинна названия чата должна находиться в границе 1-16 символов.');
		}

		socket.emit('create', roomName, roomPass, roomIsPublic);
	});
	/* ================================== */

	/* ========= EXPORTING HTML ========= */
	window.templates['create'] = { init, terminate, html };
	/* ================================== */
}
