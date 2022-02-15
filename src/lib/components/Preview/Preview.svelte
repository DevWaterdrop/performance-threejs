<script lang="ts">
	import type { SceneSettings } from '$lib/types';
	import { onMount } from 'svelte';
	import MacawScene from '$lib/threejs/scene';
	import MacawImage from '$lib/threejs/image';

	export let images: HTMLImageElement[];
	export let sceneSettings: SceneSettings;
	export let imagesLoadStatus: boolean[];

	let container: HTMLDivElement;
	let scene: MacawScene;

	onMount(() => {
		scene = new MacawScene({ container, sceneSettings });

		const createImage = async (image: HTMLImageElement, index: number) => {
			const img = new MacawImage({ scene });
			await img.create(image, String(index));
			scene.Image = img;
			imagesLoadStatus[index] = true;
		};

		images.forEach(async (image, index) => {
			if (image.complete) await createImage(image, index);
			image.onload = async () => await createImage(image, index);
		});

		return () => {
			scene.cleanUp();
		};
	});

	$: if (scene) {
		scene.Settings = sceneSettings;
	}
</script>

<div class="fixed top-0 left-0 -z-10 h-screen w-screen" bind:this={container} />
