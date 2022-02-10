<script lang="ts">
	import type { PreviewSettings } from '$lib/types';
	import { onMount } from 'svelte';
	import Footer from '$lib/components/Footer/Footer.svelte';
	import Nav from '$lib/components/Nav/Nav.svelte';
	import Preview from '$lib/components/Preview/Preview.svelte';
	import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
	import { isDarkMode } from '$lib/stores';

	const lengthImages = 20;

	let images: HTMLImageElement[] = [];
	let imagesLoadStatus: boolean[] = [...Array(lengthImages)].fill(false);
	let previewSettings: PreviewSettings = {
		options: {
			alpha: false,
			color: 0x000000
		},
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

	$: previewSettings.options.color = $isDarkMode ? 0x000000 : 0xffffff;
	$: isImagesLoaded = imagesLoadStatus.every(Boolean);

	const imgs = [...Array(lengthImages)].map((_value, index) => ({
		src: `https://picsum.photos/500/500?random=${index}.webp`
	}));
</script>

<svelte:head>
	<title>Performance Threejs</title>
</svelte:head>

{#if isImagesLoaded}
	<Preview {images} {previewSettings} />
{/if}
<Sidebar bind:previewSettings />
<div class="flex min-h-screen flex-col py-8 pl-24 pr-8 dark:text-white">
	<Nav />
	<div class="grid grid-cols-3 gap-4 2xl:grid-cols-5">
		{#each imgs as img, index (img.src)}
			<img
				bind:this={images[index]}
				class="h-full w-full bg-slate-500 object-cover"
				class:opacity-20={!isImagesLoaded}
				class:opacity-0={isImagesLoaded}
				src={img.src}
				alt="Random, source: picsum.photos"
				crossorigin="anonymous"
			/>
		{/each}
	</div>
	<Footer />
</div>
