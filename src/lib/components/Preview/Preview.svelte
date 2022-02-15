<script lang="ts">
	import type { SceneSettings } from '$lib/types';
	import { onMount } from 'svelte';
	import MacawScene from '$lib/threejs/scene';

	export let images: HTMLImageElement[];
	export let sceneSettings: SceneSettings;

	let container: HTMLDivElement;
	let scene: MacawScene;

	onMount(() => {
		scene = new MacawScene({ container, images, sceneSettings });

		return () => {
			scene.cleanUp();
		};
	});

	$: if (scene) {
		scene.Settings = sceneSettings;
	}
</script>

<div class="fixed top-0 left-0 -z-10 h-screen w-screen" bind:this={container} />
