<script lang="ts">
	import { onMount } from 'svelte';
	import { scene } from '$lib/stores';
	import { MacawScene, MacawImage } from 'macaw-threejs';

	export let images: HTMLImageElement[];
	// TODO Refactor to Type
	export let sceneType: MacawScene['type'];
	// TODO Refactor to SceneSettings
	export let sceneSettings: MacawScene['settings'];
	export let imagesLoadStatus: boolean[];

	let container: HTMLDivElement;

	onMount(() => {
		scene.set(new MacawScene({ container, sceneSettings, type: sceneType }));

		const createImage = async (image: HTMLImageElement, index: number) => {
			const img = new MacawImage({ element: image, scene: $scene, id: String(index) });
			await img.create();
			$scene.Image = img;
			imagesLoadStatus[index] = true;
		};

		images.forEach(async (image, index) => {
			if (image.complete) await createImage(image, index);
			image.onload = async () => await createImage(image, index);
		});

		return () => {
			$scene.cleanUp();
		};
	});

	$: if ($scene) {
		$scene.Settings = sceneSettings;
	}
</script>

<div
	class="{sceneType} top-0 left-0 -z-10 {sceneType === 'absolute'
		? 'h-full w-full'
		: 'h-screen w-screen'} "
	bind:this={container}
/>
