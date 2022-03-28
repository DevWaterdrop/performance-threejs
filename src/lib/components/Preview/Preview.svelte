<script lang="ts">
	import { onMount } from 'svelte';
	import { scene } from '$lib/stores';
	import { MacawScene, MacawImage } from 'macaw-threejs';

	export let images: HTMLImageElement[];
	// TODO Refactor to SceneSettings
	export let sceneSettings: MacawScene['settings'];
	export let imagesLoadStatus: boolean[];

	let container: HTMLDivElement;

	onMount(() => {
		scene.set(new MacawScene({ container, sceneSettings }));

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

<div class="fixed top-0 left-0 -z-10 h-screen w-screen" bind:this={container} />
<div class="fixed top-6 right-6 z-50 flex  flex-col" />
