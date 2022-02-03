<script lang="ts">
	export let handler: (...args: unknown[]) => unknown;
	export let enabled = false;
</script>

<button
	class="max-w-max border px-2 transition border-black hover:bg-black hover:text-white dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
	class:btn--enabled={enabled}
	on:click={handler}
>
	<slot />
</button>
