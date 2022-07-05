<script lang="ts">
	import { onMount } from 'svelte';
	import { macaw } from '$lib/stores';
	import { MacawCore, MacawImage } from 'macaw-threejs';

	export let images: HTMLImageElement[];
	export let sceneSettings: Partial<MacawCore['scene']['settings']>;
	export let imagesLoadStatus: boolean[];

	let container: HTMLDivElement;

	onMount(() => {
		macaw.set(new MacawCore({ container, sceneSettings }));

		const createImage = async (image: HTMLImageElement, index: number) => {
			await new MacawImage({ element: image, core: $macaw, id: String(index) }).create();
			imagesLoadStatus[index] = true;
		};

		images.forEach(async (image, index) => {
			if (image.complete) await createImage(image, index);
			image.onload = async () => await createImage(image, index);
		});

		return () => {
			$macaw.cleanUp();
		};
	});

	$: if ($macaw) {
		$macaw.scene.setSettings(sceneSettings);
	}
</script>

<div
	class="{sceneSettings.type} top-0 left-0 -z-10 {sceneSettings.type === 'absolute'
		? 'h-full w-full'
		: 'h-screen w-screen'} "
	aria-hidden="true"
	bind:this={container}
/>
