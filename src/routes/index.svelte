<script lang="ts">
	import Button from '$lib/components/Button/Button.svelte';
	import Footer from '$lib/components/Footer/Footer.svelte';
	import Nav from '$lib/components/Nav/Nav.svelte';
	import Preview from '$lib/components/Preview/Preview.svelte';
	import { onMount } from 'svelte';

	let img: HTMLImageElement;
	let isImgLoaded = false;
	let previewSettings: PreviewSettings = {
		glitch: {
			enable: false,
			noiseIntensity: 0.01,
			offsetIntensity: 0.02,
			colorOffsetIntensity: 1.5
		},
		waveClick: {
			enable: false
		}
	};

	onMount(() => {
		if (img.complete) isImgLoaded = true;
		img.onload = () => (isImgLoaded = true);
	});
</script>

<svelte:head>
	<title>Performance Threejs</title>
</svelte:head>

{#if isImgLoaded}
	<Preview images={[img]} {previewSettings} />
{/if}
<div class="flex flex-col p-8 min-h-screen dark:text-white">
	<Nav />
	<div class="flex">
		<div class="relative w-2/5 flex flex-col">
			<img
				bind:this={img}
				class="w-full h-96 object-cover opacity-0"
				src="images/unsplash_image_smaller_80.jpg"
				alt="author - Sascha Bosshard, source: unsplash.com"
			/>
		</div>
		<div class="w-px mx-4 bg-black dark:bg-white" />
		<div class="w-3/5 flex flex-col gap-2">
			<div class="flex flex-col">
				<label for="waveClick">Wave [Click]</label>
				<Button
					enabled={previewSettings.waveClick.enable}
					handler={() => {
						previewSettings.waveClick.enable = !previewSettings.waveClick.enable;
					}}>Enable</Button
				>
			</div>
			<div class="flex flex-col">
				<label for="glitch">Glitch</label>
				<Button
					enabled={previewSettings.glitch.enable}
					handler={() => {
						previewSettings.glitch.enable = !previewSettings.glitch.enable;
					}}>Enable</Button
				>
				<input
					type="range"
					min={0}
					max={0.1}
					name="glitch"
					step={0.001}
					bind:value={previewSettings.glitch.noiseIntensity}
				/>
				<input
					type="range"
					min={0}
					max={0.1}
					name="glitch"
					step={0.001}
					bind:value={previewSettings.glitch.offsetIntensity}
				/>
				<input
					type="range"
					min={0.1}
					max={5}
					name="glitch"
					step={0.001}
					bind:value={previewSettings.glitch.colorOffsetIntensity}
				/>
				<span class="text-xs">Description</span>
			</div>
		</div>
	</div>
	<Footer />
</div>
