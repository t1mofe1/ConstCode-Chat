{
	/* ============== HTML ============== */
	const html = StringToHTML(`
		<div class="center">
			<div class="form">
				<div class="form_title">Создать или присоединиться</div>
				<div class="actions">
					<button class="action">Создать</button>
					<button class="action">Присоединиться</button>
				</div>
			</div>
		</div>`);
	/* ================================== */

	/* =============== JS =============== */
	html.querySelector('.actions').children[0].addEventListener('click', () => window.showTemplate('create'));
	html.querySelector('.actions').children[1].addEventListener('click', () => window.showTemplate('join'));
	/* ================================== */

	/* ========= EXPORTING HTML ========= */
	window.templates['coj'] = { html };
	/* ================================== */
}
