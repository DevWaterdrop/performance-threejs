<script lang="ts">
	import { scene } from '$lib/stores';
	import chevronSVG from '$lib/assets/icons/chevron.svg?raw';
	import { ClickWave, ScrollWrapUnder, ScrollWaveTop } from 'macaw-threejs';
	import ThemeSwitch from '../ThemeSwitch/ThemeSwitch.svelte';
	import EffectBlock from '../EffectBlock/EffectBlock.svelte';
	import Input from '../Input/Input.svelte';

	export let isAnyImageLoaded: boolean;
	export let isDev = false;

	let opened = false;

	let settings = {
		scrollWrapUnder: {
			enable: false
		},
		scrollWaveTop: {
			enable: false
		},
		clickWave: {
			enable: false,
			settings: {
				strength: 10.0
			}
		}
	};

	$: disabled = !isAnyImageLoaded;

	const effects = {
		scrollWrapUnder: new ScrollWrapUnder(),
		scrollWaveTop: new ScrollWaveTop(),
		clickWave: new ClickWave(settings.clickWave.settings)
	};

	const handleClick = () => (opened = !opened);
</script>

<!-- Inspired by https://dribbble.com/shots/16451584-Minimal-sidebar-navigation-for-dashboard -->
<div
	class="fixed top-0 left-0 z-10 flex h-screen w-16 flex-col items-center border-r-2 border-sidebar-border bg-sidebar-main p-2 text-white transition-all"
	class:w-96={opened}
>
	<button
		class="absolute top-5 -right-[0.875rem] z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-sidebar-third text-2xl transition-transform"
		class:translate-x-5={!opened}
		on:click={handleClick}
	>
		<div class="svg" class:rotate-180={opened}>
			{@html chevronSVG}
		</div>
	</button>
	<div class="flex w-full flex-col gap-2">
		<ThemeSwitch />
		<EffectBlock
			name="Scroll"
			bind:enabled={settings.scrollWrapUnder.enable}
			{opened}
			{disabled}
			click={() =>
				(settings.scrollWrapUnder.enable = $scene.addEffect(
					'scrollWrapUnder',
					effects.scrollWrapUnder
				))}
		/>
		<EffectBlock
			name="Wave scroll (top)"
			bind:enabled={settings.scrollWaveTop.enable}
			{opened}
			{disabled}
			click={() =>
				(settings.scrollWaveTop.enable = $scene.addEffect('scrollWaveTop', effects.scrollWaveTop))}
		/>
		<EffectBlock
			name="Click wave"
			bind:enabled={settings.clickWave.enable}
			{opened}
			{disabled}
			click={() => (settings.clickWave.enable = $scene.addEffect('clickWave', effects.clickWave))}
		>
			<svelte:fragment slot="content">
				<Input
					name="ClickWave strength"
					trigger={() => {
						effects.clickWave.setSettings(settings.clickWave.settings);
					}}
					bind:value={settings.clickWave.settings.strength}>Strength</Input
				>
			</svelte:fragment>
		</EffectBlock>
		{#if isDev}
			<div class="flex w-full flex-col gap-2">
				<button
					class="overflow-hidden border p-2"
					on:click={() => {
						const { prettyFragment, prettyVertex } = $scene.imageShader.PrettyShaders;
						console.log('🧪 ~ prettyVertex', prettyVertex);
						console.log('🧪 ~ prettyFragment', prettyFragment);
					}}>Image shaders</button
				>
				<button
					class="overflow-hidden border p-2"
					on:click={() => {
						const { prettyFragment, prettyVertex } = $scene.composerShader.PrettyShaders;
						console.log('🧪 ~ prettyVertex', prettyVertex);
						console.log('🧪 ~ prettyFragment', prettyFragment);
					}}>Composer shaders</button
				>
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.svg > :global(svg) {
		@apply h-5 w-5;
	}
</style>
