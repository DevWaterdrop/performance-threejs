<script lang="ts">
	import type { SceneSettings } from '$lib/types';
	import chevronSVG from '$lib/assets/icons/chevron.svg?raw';
	import ThemeSwitch from '../ThemeSwitch/ThemeSwitch.svelte';
	import EffectBlock from '../EffectBlock/EffectBlock.svelte';
	import Input from '../Input/Input.svelte';

	export let sceneSettings: SceneSettings;
	export let isImagesLoaded: boolean;

	let opened = false;

	const handleClick = () => (opened = !opened);
</script>

<!-- Inspired by https://dribbble.com/shots/16451584-Minimal-sidebar-navigation-for-dashboard -->
<div
	class="fixed top-0 left-0 z-10 flex h-screen w-16 flex-col items-center border-r-2 border-sidebar-border bg-sidebar-main p-2 text-white transition-all"
	class:w-96={opened}
>
	<div
		class="absolute top-5 -right-[0.875rem] z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-sidebar-third text-2xl transition-transform"
		class:translate-x-5={!opened}
		on:click={handleClick}
	>
		<div class="svg" class:rotate-180={opened}>
			{@html chevronSVG}
		</div>
	</div>
	<div class="flex w-full flex-col gap-2">
		<ThemeSwitch />
		<EffectBlock
			name="Scroll"
			bind:enabled={sceneSettings.scroll.enable}
			{opened}
			disabled={!isImagesLoaded}
		/>
		<EffectBlock
			name="Wave scroll (top)"
			bind:enabled={sceneSettings.scrollTop.enable}
			{opened}
			disabled={!isImagesLoaded}
		/>
		<EffectBlock
			name="Click wave"
			bind:enabled={sceneSettings.waveClick.enable}
			{opened}
			disabled={!isImagesLoaded}
		/>
		<EffectBlock
			name="Glitch"
			bind:enabled={sceneSettings.glitch.enable}
			{opened}
			disabled={!isImagesLoaded}
		>
			<svelte:fragment slot="content">
				<Input name="glitch noiseIntensity" bind:value={sceneSettings.glitch.noiseIntensity}
					>Noise</Input
				>
				<Input name="glitch offsetIntensity" bind:value={sceneSettings.glitch.offsetIntensity}
					>Offset</Input
				>
				<Input
					name="glitch colorOffsetIntensity"
					bind:value={sceneSettings.glitch.colorOffsetIntensity}>Color offset</Input
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
