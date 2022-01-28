<script lang="ts">
	import darkModeSVG from '$lib/assets/icons/dark_mode.svg?raw';
	import lightModeSVG from '$lib/assets/icons/light_mode.svg?raw';

	let isDark = false;

	const handleClick = () => {
		isDark = !isDark;
		const html = document.getElementsByTagName('html')[0];

		if (isDark) return html.classList.add('dark');
		return html.classList.remove('dark');
	};
</script>

<button class:dark={isDark} class:light={!isDark} on:click={handleClick}>
	{#if isDark}
		{@html darkModeSVG}
	{:else}
		{@html lightModeSVG}
	{/if}
</button>

<style lang="postcss">
	.light > :global(svg) {
		@apply fill-black;
	}

	.dark > :global(svg) {
		@apply fill-white;
	}
</style>
