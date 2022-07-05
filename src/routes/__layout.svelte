<script lang="ts">
	import '../styles/app.css';
	import '../styles/apply.css';
	import '../styles/layers.css';

	const title = 'Performance Threejs 🦜';
	const description = 'Small project by Hurevych Kostiantyn';
	const coverLink = 'https://www.waterdrop.dev/images/cover.png';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="author" content="Hurevych Kostiantyn" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={coverLink} />
	<meta name="twitter:image" content={coverLink} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="theme-color" content="#000000" />

	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
		rel="stylesheet"
	/>

	<script>
		let global;

		if (global === undefined) {
			global = window;
		}

		const html = document.getElementsByTagName('html')[0];

		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			html.classList.add('dark');
		} else {
			html.classList.remove('dark');
		}
	</script>
</svelte:head>

<main class="relative">
	<slot />
</main>
