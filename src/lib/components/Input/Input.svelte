<script lang="ts">
	export let value: unknown;
	export let name: string;
</script>

<div class="flex gap-2 items-center">
	<label class="w-1/4" for={name}><slot /></label>
	<input
		class="bg-transparent outline-none px-1 border border-black dark:border-white"
		{...$$restProps}
		{name}
		bind:value
	/>
</div>
