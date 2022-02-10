<script lang="ts">
	import '../styles/app.css';
	import '../styles/apply.css';
	import '../styles/layers.css';
</script>

<svelte:head>
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
