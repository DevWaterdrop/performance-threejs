<script context="module" lang="ts">
	export const load: import('@sveltejs/kit').Load = async ({ fetch, url: { searchParams } }) => {
		const href = 'https://picsum.photos';
		const limit = searchParams.get('limit') || 20;
		const size = searchParams.get('size') || 500;
		const response = await fetch(`${href}/v2/list?page=2&limit=${limit}`);
		if (!response.ok) return { status: response.status, error: `${href} - is down?` };

		const images: { id: string }[] = await response.json();
		const imagesWithSrc = images.map(({ id }) => ({
			id,
			src: `${href}/id/${id}/${size}/${size}.webp`
		}));

		return {
			status: response.status,
			props: { images: imagesWithSrc }
		};
	};
</script>

<script lang="ts">
	import type { PreviewSettings } from '$lib/types';
	import { onMount } from 'svelte';
	import Footer from '$lib/components/Footer/Footer.svelte';
	import Nav from '$lib/components/Nav/Nav.svelte';
	import Preview from '$lib/components/Preview/Preview.svelte';
	import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
	import { isDarkMode } from '$lib/stores';

	export let images: { id: string; src: string }[];

	let imagesElement: HTMLImageElement[] = [];
	let imagesLoadStatus: boolean[] = [...Array(images.length)].fill(false);
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
		},
		scrollTop: {
			enable: false
		}
	};

	onMount(() => {
		imagesElement.forEach((image, index) => {
			if (image.complete) imagesLoadStatus[index] = true;
			image.onload = () => (imagesLoadStatus[index] = true);
		});
	});

	$: previewSettings.options.color = $isDarkMode ? 0x000000 : 0xffffff;
	$: isImagesLoaded = imagesLoadStatus.every(Boolean);
</script>

<svelte:head>
	<title>Performance Threejs</title>
</svelte:head>

{#if isImagesLoaded}
	<Preview images={imagesElement} {previewSettings} />
{/if}
<Sidebar bind:previewSettings {isImagesLoaded} />
<div class="flex min-h-screen flex-col py-8 pl-24 pr-8 dark:text-white">
	<Nav />
	<div class="grid grid-cols-3 gap-4 2xl:grid-cols-5">
		{#each images as image, index (image.id)}
			<img
				bind:this={imagesElement[index]}
				class="h-full w-full bg-slate-500 object-cover"
				class:opacity-20={!isImagesLoaded}
				class:opacity-0={isImagesLoaded}
				src={image.src}
				alt="Random, source: picsum.photos"
				crossorigin="anonymous"
			/>
		{/each}
	</div>
	<Footer />
</div>
