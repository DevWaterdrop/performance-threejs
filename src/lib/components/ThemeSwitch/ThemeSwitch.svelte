<script lang="ts">
	import darkModeSVG from '$lib/assets/icons/dark_mode.svg?raw';
	import lightModeSVG from '$lib/assets/icons/light_mode.svg?raw';
	import { isDarkMode } from '$lib/stores';

	const handleClick = () => {
		//* Reverse of same code in routes/__layout.svelte, but without localStorage
		const html = document.getElementsByTagName('html')[0];

		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			localStorage.theme = 'light';
			html.classList.remove('dark');
			isDarkMode.set(false);
		} else {
			localStorage.theme = 'dark';
			html.classList.add('dark');
			isDarkMode.set(true);
		}
	};

	$: if (global.window) {
		isDarkMode.set(document.querySelector('html').classList.contains('dark'));
	}
</script>

<button
	class="relative mb-4 flex h-12 w-[2.875rem] items-center justify-center rounded-xl border border-transparent bg-sidebar-second p-2 outline-none"
	on:click={handleClick}
>
	<div class="light hidden dark:block">
		{@html darkModeSVG}
	</div>
	<div class="light dark:hidden">
		{@html lightModeSVG}
	</div>
</button>

<style lang="postcss">
	.light > :global(svg) {
		@apply fill-white;
	}
</style>
