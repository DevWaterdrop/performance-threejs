<script lang="ts">
	import chevronSVG from '$lib/assets/icons/chevron.svg?raw';

	export let enabled: boolean;
	export let opened: boolean;
	export let name: string;
	export let disabled: boolean;

	let show = false;

	const firstLetter = name.charAt(0);
	const isContentSlot = $$slots.content;

	const handleClick = () => (enabled = !enabled);
	const handleChevronClick = () => {
		if (!disabled) return (show = !show);
	};
</script>

<button
	class="relative flex h-12 w-full items-center gap-2 overflow-hidden rounded-xl border-2 border-transparent bg-sidebar-second p-2 outline-none transition-colors disabled:opacity-50"
	class:border-green-500={enabled}
	on:click={handleClick}
	{disabled}
>
	<span
		class="flex min-h-full min-w-[1.75rem] items-center justify-center text-2xl font-semibold uppercase"
		>{firstLetter}</span
	>
	<span class="whitespace-nowrap font-semibold">{name}</span>
	{#if isContentSlot}
		<div
			class="absolute right-2 rotate-90 transition-all"
			class:-rotate-90={show}
			class:opacity-0={!opened}
			class:pointer-events-none={!opened}
			on:click|stopPropagation={handleChevronClick}
		>
			{@html chevronSVG}
		</div>
	{/if}
</button>
{#if show && opened && isContentSlot}
	<div class="flex gap-4 p-2">
		<div class="h-full w-px rounded border border-sidebar-third" />
		<div class="flex flex-col gap-2 overflow-hidden">
			<slot name="content" />
		</div>
	</div>
{/if}
