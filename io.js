import { Server } from 'socket.io';
import server from './server.js';

const DEFAULT_CHAT_TITLE = 'ConstCode';

const io = new Server(server, { cors: {} });

let messageIdCounter = 0;

const names = [];

const chats = [
	{
		title: DEFAULT_CHAT_TITLE,
		default: true,
		password: false,
		locked: false,
		isPublic: true,
		sockets: [],
		messages: [],
	},
];

io.on('connection', (socket) => {
	let session = {
		authenticated: false,
		name: '',
		chat: null,
	};

	socket.session = session;

	socket.emit('chats', getChats());

	socket.on('disconnect', () => {
		removeItem(names, session.name);

		if (session.chat) {
			const { chat } = session;
			removeItem(chat.sockets, socket);

			if (!chat.sockets.length && !chat.default) {
				removeItem(chats, chat);
			}

			io.emit('chats', getChats());
		}

		session = null;
		socket.session = null;
	});

	socket.on('signin', (name) => {
		name = name || '';

		if (session.authenticated) {
			socket.emit('error', `Пользователь уже авторизован как "${session.name}".`);
			return;
		}

		name = name.replace(/\s+/g, ' ').trim();
		const { length } = name;

		if (length < 3 || length > 13) {
			socket.emit('error', 'Длинна имени должна укладываться в размер 3-13 символов.');
			return;
		}

		if (names.includes(name)) {
			socket.emit('error', `Пользователь с ником ${name} уже есть.`);
			return;
		}

		session.authenticated = true;
		session.name = name;
		names.push(name);

		socket.emit('signin');
	});

	socket.on('join', (title, password) => {
		title = title || DEFAULT_CHAT_TITLE;

		if (!session.authenticated) {
			socket.emit('error', 'Вы не авторизованы.');
			return;
		}

		const chat = chats.find((chat) => chat.title === title);

		if (!chat) {
			socket.emit('error', `Чат ${title} не существует.`);
			return;
		}

		if (chat.locked && chat.password !== password) {
			socket.emit('error', 'Пароль не подходит');
			return;
		}

		if (session.chat) {
			socket.emit('error', 'Вы уже состоите в чате.');
			return;
		}

		if (chat.sockets.includes(socket)) {
			socket.emit('error', 'Вы уже состоите в этом чате.');
			return;
		}

		chat.sockets.push(socket);
		session.chat = chat;
		io.emit('chats', getChats());
		socket.emit('messages', chat.messages);
		socket.emit('join');
	});

	socket.on('message', (content) => {
		if (!session.authenticated) {
			socket.emit('error', 'Вы не авторизованы.');
			return;
		}

		if (!session.chat) {
			socket.emit('error', 'Вы не состоите ни в каком чате.');
			return;
		}

		const validation = getMessageValidation(content);

		if (validation.wrong) {
			socket.emit('error', validation.errors[0]);
			return;
		}

		const message = {
			id: ++messageIdCounter,
			name: session.name,
			date: Date.now(),
			content,
			likes: 0,
			dislikes: 0,
			likeSockets: new WeakSet(),
			dislikeSockets: new WeakSet(),
		};

		session.chat.messages.push(message);
		session.chat.messages = session.chat.messages.splice(-100);

		session.chat.sockets.forEach((socket) => socket.emit('message:add', message));
	});

	socket.on('message:like', (id) => {
		if (!session.authenticated) {
			socket.emit('error', 'Вы не авторизованы.');
			return;
		}

		const [chat, message] = (() => {
			for (const chat of chats) {
				for (const message of chat.messages) {
					if (message.id === id) {
						return [chat, message];
					}
				}
			}

			return [null, null];
		})();

		if (!message) {
			socket.emit('error', 'Сообщение не найдено.');
			return;
		}

		if (session.chat !== chat) {
			socket.emit('error', 'Вы не состоите в чате сообщения.');
			return;
		}

		if (message.likeSockets.has(socket)) {
			message.likeSockets.delete(socket);
			message.likes--;
		} else {
			message.likeSockets.add(socket);
			message.likes++;
		}

		chat.sockets.forEach((socket) => socket.emit('message:like', message.id, message.likes));
	});

	socket.on('message:dislike', (id) => {
		if (!session.authenticated) {
			socket.emit('error', 'Вы не авторизованы.');
			return;
		}

		const [chat, message] = (() => {
			for (const chat of chats) {
				for (const message of chat.messages) {
					if (message.id === id) {
						return [chat, message];
					}
				}
			}

			return [null, null];
		})();

		if (!message) {
			socket.emit('error', 'Сообщение не найдено.');
			return;
		}

		if (session.chat !== chat) {
			socket.emit('error', 'Вы не состоите в чате сообщения.');
			return;
		}

		if (message.dislikeSockets.has(socket)) {
			message.dislikeSockets.delete(socket);
			message.dislikes--;
		} else {
			message.dislikeSockets.add(socket);
			message.dislikes++;
		}

		chat.sockets.forEach((socket) => socket.emit('message:dislike', message.id, message.dislikes));
	});

	socket.on('create', (title, password = null, isPublic = true) => {
		if (!session.authenticated) {
			socket.emit('error', 'Вы не авторизованы.');
			return;
		}

		if (session.chat) {
			socket.emit('error', 'Вы уже состоите в чате.');
			return;
		}

		if (!(0 < title.length && title.length <= 16)) {
			socket.emit('error', 'Длинна названия чата должна находиться в границе 1-16 символов.');
			return;
		}

		if (chats.find((chat) => chat.title === title)) {
			socket.emit('error', `Чат "${title}" уже существует`);
			return;
		}

		const chat = {
			title,
			default: false,
			password: password,
			locked: Boolean(password),
			isPublic,
			sockets: [],
			messages: [],
		};

		chat.sockets.push(socket);
		session.chat = chat;
		chats.push(chat);
		io.emit('chats', getChats());
		socket.emit('messages', chat.messages);
		socket.emit('create');
	});
});

const removeItem = (array, item) => {
	const index = array.indexOf(item);

	if (item !== -1) {
		array.splice(index, 1);
	}
};

const _has = (a, b) => Object.prototype.hasOwnProperty.call(a, b);

const _pick = (obj, keys) =>
	keys.reduce((acc, key) => {
		if (_has(obj, key)) {
			acc[key] = obj[key];
		}

		return acc;
	}, {});

const getChats = () =>
	chats
		.filter((chat) => chat.isPublic)
		.map((chat) => ({
			..._pick(chat, ['title', 'locked']),
			counter: chat.sockets.length,
		}));

const getMessageValidation = (message) => {
	message = message.replace(/\s+/g, ' ').trim();

	const validation = {
		errors: [],
		wrong: false,
		message,
	};

	const { length } = message;

	if (!(1 <= length && length <= 200)) {
		validation.errors.push('Длинна сообщения должно находиться в диапозоне 1-200 символов.');
	}

	validation.wrong = validation.errors.length > 1;

	return validation;
};
