<script lang="ts">
	import type { PreviewSettings } from '$lib/types';
	import chevronSVG from '$lib/assets/icons/chevron.svg?raw';
	import ThemeSwitch from '../ThemeSwitch/ThemeSwitch.svelte';
	import EffectBlock from '../EffectBlock/EffectBlock.svelte';
	import Input from '../Input/Input.svelte';

	export let previewSettings: PreviewSettings;

	let opened = false;
</script>

<!-- Inspired by https://dribbble.com/shots/16451584-Minimal-sidebar-navigation-for-dashboard -->
<div
	class="fixed top-0 left-0 z-10 flex h-screen w-16 flex-col items-center border-r-2 border-sidebar-border bg-sidebar-main p-2 text-white transition-all"
	class:w-96={opened}
>
	<div
		class="absolute top-5 -right-[0.875rem] z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-sidebar-third text-2xl transition-transform"
		class:translate-x-5={!opened}
		on:click={() => (opened = !opened)}
	>
		<div class="svg" class:rotate-180={opened}>
			{@html chevronSVG}
		</div>
	</div>
	<div class="flex w-full flex-col gap-2">
		<ThemeSwitch />
		<EffectBlock name="Scroll" bind:enabled={previewSettings.scroll.enable} {opened} />
		<EffectBlock name="Click wave" bind:enabled={previewSettings.waveClick.enable} {opened} />
		<EffectBlock name="Glitch" bind:enabled={previewSettings.glitch.enable} {opened}>
			<svelte:fragment slot="content">
				<Input name="glitch noiseIntensity" bind:value={previewSettings.glitch.noiseIntensity}
					>Noise</Input
				>
				<Input name="glitch offsetIntensity" bind:value={previewSettings.glitch.offsetIntensity}
					>Offset</Input
				>
				<Input
					name="glitch colorOffsetIntensity"
					bind:value={previewSettings.glitch.colorOffsetIntensity}>Color offset</Input
				>
			</svelte:fragment>
		</EffectBlock>
	</div>
</div>

<style lang="postcss">
	.svg > :global(svg) {
		@apply h-5 w-5;
	}
</style>
