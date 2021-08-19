{
	/* ============== HTML ============== */
	const html = StringToHTML(`
	<div class="center">
		<div class="form">
			<div class="form_title">Представьтесь</div>
			<input type="text" class="input" />
			<div class="subtitle subtitle-right">
				Введите имя и нажмите Enter
			</div>
		</div>
	</div>`);
	/* ================================== */

	/* =============== JS =============== */
	function init() {
		socket.on('signin', signinHandler);
	}

	function terminate() {
		socket.off('signin', signinHandler);
	}

	function signinHandler() {
		window.user = { username: html.querySelector('input').value.trim() };
		window.showTemplate('coj');
	}

	html.querySelector('input').addEventListener('keyup', (e) => {
		if (e.key === 'Enter') {
			const username = html.querySelector('input').value.trim();

			if (username === '') return;

			if (username.length < 4 || username.length > 12) {
				return alert('Username must be from 4 to 12 characters');
			}

			socket.emit('signin', username);
		}
	});
	/* ================================== */

	/* ========= EXPORTING HTML ========= */
	window.templates['login'] = { init, terminate, html };
	/* ================================== */
}
