<script lang="ts">
	export let value: unknown;
	export let name: string;
	export let trigger: () => void;
</script>

<div class="flex items-center justify-between gap-2">
	<label class="w-2/5 truncate" for={name}><slot /></label>
	<input
		class="w-3/5 appearance-none rounded border border-transparent bg-sidebar-second px-2 py-1 text-inherit outline-none transition-colors focus:border-white"
		{...$$restProps}
		{name}
		on:change={() => {
			trigger();
		}}
		bind:value
	/>
</div>
