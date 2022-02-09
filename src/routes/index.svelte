<script lang="ts">
	import type { PreviewSettings } from '$lib/types';
	import { onMount } from 'svelte';
	import Footer from '$lib/components/Footer/Footer.svelte';
	import Nav from '$lib/components/Nav/Nav.svelte';
	import Preview from '$lib/components/Preview/Preview.svelte';
	import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';

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
<Sidebar bind:previewSettings />
<div class="flex min-h-screen flex-col py-8 pl-24 pr-8 dark:text-white">
	<Nav />
	<div class="grid grid-cols-2 gap-4 2xl:grid-cols-3">
		<img
			bind:this={images[0]}
			class="h-full w-full object-cover opacity-0"
			src="images/nature_unsplash_image_smaller_80.jpg"
			alt="author - Sascha Bosshard, source: unsplash.com"
		/>
		<img
			bind:this={images[1]}
			class="h-full w-full object-cover opacity-0"
			src="images/dino_unsplash_image_smaller_80.jpg"
			alt="author - James Lee, source: unsplash.com"
		/>
		<img
			bind:this={images[2]}
			class="h-full w-full object-cover opacity-0"
			src="images/office_unsplash_image_smaller_80.jpg"
			alt="author - İrfan Simsar, source: unsplash.com"
		/>
	</div>
	<Footer />
</div>
