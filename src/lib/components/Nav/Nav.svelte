<script lang="ts">
	import ThemeSwitch from '$lib/components/ThemeSwitch/ThemeSwitch.svelte';
</script>

<nav class="flex justify-between mb-8 items-center">
	<div class="flex flex-col gap-1">
		<h1 class="text-3xl font-bold">Performance Three.js</h1>
		<span class="text-xs"
			>Supported by <a
				class="transition border-b border-transparent hover:border-black hover:dark:border-white"
				href="https://www.halo-lab.com"
				target="_blank"
				rel="noopener noreferrer">Halo lab</a
			></span
		>
	</div>
	<ThemeSwitch />
</nav>
