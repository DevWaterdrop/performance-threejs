<script lang="ts">
	import darkModeSVG from '$lib/assets/icons/dark_mode.svg?raw';
	import lightModeSVG from '$lib/assets/icons/light_mode.svg?raw';

	const handleClick = () => {
		//* Reverse of same code in routes/__layout.svelte, but without localStorage
		const html = document.getElementsByTagName('html')[0];

		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			localStorage.theme = 'light';
			html.classList.remove('dark');
		} else {
			localStorage.theme = 'dark';
			html.classList.add('dark');
		}
	};
</script>

<button on:click={handleClick}>
	<div class="dark hidden dark:block">
		{@html darkModeSVG}
	</div>
	<div class="light dark:hidden">
		{@html lightModeSVG}
	</div>
</button>

<style lang="postcss">
	.light > :global(svg) {
		@apply fill-black;
	}

	.dark > :global(svg) {
		@apply fill-white;
	}
</style>
