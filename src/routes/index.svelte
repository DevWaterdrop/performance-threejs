<script context="module" lang="ts">
	export const load: import('@sveltejs/kit').Load = async ({ fetch, url: { searchParams } }) => {
		const href = 'https://picsum.photos';

		const limit = searchParams.get('limit') || 20;
		const size = searchParams.get('size') || 500;
		const isDev = searchParams.get('dev') !== null;

		const response = await fetch(`${href}/v2/list?page=2&limit=${limit}`);
		if (!response.ok) return { status: response.status, error: `${href} - is down?` };

		const images: { id: string }[] = await response.json();
		const imagesWithSrc = images.map(({ id }) => ({
			id,
			src: `${href}/id/${id}/${size}/${size}.webp`
		}));

		return {
			status: response.status,
			props: { images: imagesWithSrc, isDev }
		};
	};
</script>

<script lang="ts">
	import Footer from '$lib/components/Footer/Footer.svelte';
	import Nav from '$lib/components/Nav/Nav.svelte';
	import Preview from '$lib/components/Preview/Preview.svelte';
	import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
	import { isDarkMode } from '$lib/stores';
	// TODO Refactor to SceneSettings
	import type { MacawScene } from 'macaw-threejs';

	export let images: { id: string; src: string }[];
	export let isDev = false;

	let imagesElement: HTMLImageElement[] = [];
	let imagesLoadStatus: boolean[] = [...Array(images.length)].fill(false);

	// TODO Refactor to SceneSettings
	let sceneSettings: MacawScene['settings'] = {
		alpha: false,
		color: 0x000000
	};

	$: sceneSettings.color = $isDarkMode ? 0x000000 : 0xffffff;
	$: isAnyImageLoaded = imagesLoadStatus.some(Boolean);
</script>

<svelte:head>
	<title>Performance Threejs 🦜</title>
</svelte:head>

<Preview images={imagesElement} {sceneSettings} bind:imagesLoadStatus />
<Sidebar {isAnyImageLoaded} {isDev} />
<div class="flex min-h-screen flex-col py-8 pl-24 pr-8 dark:text-white">
	<Nav />
	<div class="grid grid-cols-3 gap-4 2xl:grid-cols-5">
		{#each images as image, index (image.id)}
			<img
				bind:this={imagesElement[index]}
				class="h-full w-full bg-slate-500 object-cover"
				class:opacity-20={!imagesLoadStatus[index]}
				class:opacity-0={imagesLoadStatus[index]}
				src={image.src}
				alt="Random, source: picsum.photos"
				crossorigin="anonymous"
			/>
		{/each}
	</div>
	<Footer />
</div>
