<script lang="ts">
	import type { PreviewSettings } from '$lib/types';
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button/Button.svelte';
	import Footer from '$lib/components/Footer/Footer.svelte';
	import Nav from '$lib/components/Nav/Nav.svelte';
	import Preview from '$lib/components/Preview/Preview.svelte';
	import Input from '$lib/components/Input/Input.svelte';
	import EffectBlock from '$lib/components/EffectBlock/EffectBlock.svelte';

	let images: HTMLImageElement[] = [];
	let imagesLoadStatus: boolean[] = [];
	let previewSettings: PreviewSettings = {
		glitch: {
			enable: false,
			noiseIntensity: 0.01,
			offsetIntensity: 0.02,
			colorOffsetIntensity: 1.5
		},
		waveClick: {
			enable: false
		},
		scroll: {
			enable: false
		}
	};

	onMount(() => {
		images.forEach((image, index) => {
			if (image.complete) imagesLoadStatus[index] = true;
			image.onload = () => (imagesLoadStatus[index] = true);
		});
	});

	$: isImagesLoaded = imagesLoadStatus.every(Boolean);
</script>

<svelte:head>
	<title>Performance Threejs</title>
</svelte:head>

{#if isImagesLoaded}
	<Preview {images} {previewSettings} />
{/if}
<div class="flex flex-col p-8 min-h-screen dark:text-white">
	<Nav />
	<div class="flex">
		<div class="relative w-2/5 flex flex-col items-center">
			<img
				bind:this={images[0]}
				class="w-full object-cover opacity-0"
				src="images/nature_unsplash_image_smaller_80.jpg"
				alt="author - Sascha Bosshard, source: unsplash.com"
			/>
			<div class="my-8 h-px w-1/3 bg-black dark:bg-white" />
			<img
				bind:this={images[1]}
				class="w-full object-cover opacity-0"
				src="images/dino_unsplash_image_smaller_80.jpg"
				alt="author - James Lee, source: unsplash.com"
			/>
		</div>
		<div class="w-px mx-4 bg-black dark:bg-white" />
		<div class="w-3/5 flex flex-col gap-2 items-center">
			<EffectBlock>
				<svelte:fragment slot="name">Scroll</svelte:fragment>
				<svelte:fragment slot="underName">
					<Button
						enabled={previewSettings.scroll.enable}
						handler={() => {
							previewSettings.scroll.enable = !previewSettings.scroll.enable;
						}}>Enable</Button
					>
				</svelte:fragment>
				<svelte:fragment slot="description">Description</svelte:fragment>
			</EffectBlock>
			<EffectBlock>
				<svelte:fragment slot="name">Wave</svelte:fragment>
				<svelte:fragment slot="underName">
					<Button
						enabled={previewSettings.waveClick.enable}
						handler={() => {
							previewSettings.waveClick.enable = !previewSettings.waveClick.enable;
						}}>Enable</Button
					>
				</svelte:fragment>
				<svelte:fragment slot="description">Description</svelte:fragment>
			</EffectBlock>
			<EffectBlock>
				<svelte:fragment slot="name">Glitch</svelte:fragment>
				<svelte:fragment slot="underName">
					<Button
						enabled={previewSettings.glitch.enable}
						handler={() => {
							previewSettings.glitch.enable = !previewSettings.glitch.enable;
						}}>Enable</Button
					>
				</svelte:fragment>
				<svelte:fragment slot="middle">
					<Input name="glitch noiseIntensity" bind:value={previewSettings.glitch.noiseIntensity}
						>Noise intensity</Input
					>
					<Input name="glitch offsetIntensity" bind:value={previewSettings.glitch.offsetIntensity}
						>Offset intensity</Input
					>
					<Input
						name="glitch colorOffsetIntensity"
						bind:value={previewSettings.glitch.colorOffsetIntensity}>Color offset intensity</Input
					>
				</svelte:fragment>
				<svelte:fragment slot="description">Description</svelte:fragment>
			</EffectBlock>
			<div class="my-8 h-px w-1/3 bg-black dark:bg-white" />
			<img
				bind:this={images[2]}
				class="w-2/3 object-cover opacity-0"
				src="images/office_unsplash_image_smaller_80.jpg"
				alt="author - İrfan Simsar, source: unsplash.com"
			/>
		</div>
	</div>
	<Footer />
</div>
