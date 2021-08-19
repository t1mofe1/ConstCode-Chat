{
	/* ============== HTML ============== */
	const html = StringToHTML(`
		<div class="container">
			<div class="chat">
				<div class="chat-history">
					<div class="chat-divider"></div>
				</div>
				<div class="chat-panel">
					<input type="text" class="input" style="text-align: left" />
					<button class="action" style="width: inherit">Отправить</button>
				</div>
			</div>
		</div>`);
	/* ================================== */

	/* =============== JS =============== */
	function createMessage(message) {
		const html = StringToHTML(`
			<div class="chat-message" data-id="${message.id}">
				<div class="chat-info">
					<div class="chat-username"></div>
					<div class="chat-timestamp">${new Date(message.date).toLocaleTimeString()}</div>
				</div>
				<div class="chat-state">
					<div class="chat-content"></div>
					<div class="chat-rating-panel">
						<div class="chat-rating${message.likes === 0 ? ' chat-rating-empty' : ''} chat-like">${message.likes}</div>
						<div class="chat-rating${message.dislikes === 0 ? ' chat-rating-empty' : ''} chat-dislike">${message.dislikes}</div>
					</div>
				</div>
			</div>`);

		html
			.querySelector('.chat-rating-panel')
			.querySelector('.chat-like')
			.addEventListener('click', () => socket.emit('message:like', message.id));
		html
			.querySelector('.chat-rating-panel')
			.querySelector('.chat-dislike')
			.addEventListener('click', () => socket.emit('message:dislike', message.id));

		// if (message.name === window.user.username) html.classList.add('own-message');
		html.querySelector('.chat-username').textContent = message.name;
		html.querySelector('.chat-content').textContent = message.content;

		return html;
	}

	function messageAddHandler(message) {
		const chatHistory = html.querySelector('.chat-history');
		const messageHTML = createMessage(message);
		chatHistory.appendChild(messageHTML);
		chatHistory.scrollTop = chatHistory.scrollHeight;
	}

	function messageLikeHandler(id, likes) {
		const likePanel = html.querySelector(`.chat-history .chat-message[data-id="${id}"] .chat-like`);
		likePanel.textContent = likes;
		if (likes > 0) {
			likePanel.classList.remove('chat-rating-empty');
		} else {
			likePanel.classList.add('chat-rating-empty');
		}
	}

	function messageDislikeHandler(id, dislikes) {
		const dislikePanel = html.querySelector(`.chat-history .chat-message[data-id="${id}"] .chat-dislike`);
		dislikePanel.textContent = dislikes;
		if (dislikes > 0) {
			dislikePanel.classList.remove('chat-rating-empty');
		} else {
			dislikePanel.classList.add('chat-rating-empty');
		}
	}

	function init() {
		socket.on('message:add', messageAddHandler);
		socket.on('message:like', messageLikeHandler);
		socket.on('message:dislike', messageDislikeHandler);
	}

	function terminate() {
		socket.off('message:add', messageAddHandler);
		socket.off('message:like', messageLikeHandler);
		socket.off('message:dislike', messageDislikeHandler);
	}

	function validateAndSend() {
		const input = html.querySelector('.chat-panel > input');

		if (input.value.trim().length === 0) return;

		socket.emit('message', input.value.trim());

		input.value = '';
	}

	html.querySelector('.chat-panel > input').addEventListener('keyup', (e) => {
		if (e.key === 'Enter') validateAndSend();
	});
	html.querySelector('.chat-panel > button').addEventListener('click', validateAndSend);
	/* ================================== */

	/* ========= EXPORTING HTML ========= */
	window.templates['chat'] = { init, terminate, html };
	/* ================================== */
}
