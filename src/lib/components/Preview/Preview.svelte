<script lang="ts">
	import { onMount } from 'svelte';
	import ThreePreview from '$lib/threejs/preview';

	export let images: HTMLImageElement[];

	let canvas: HTMLCanvasElement;

	onMount(() => {
		new ThreePreview({ canvas, images });
	});
</script>

<canvas class="fixed top-0 left-0 h-screen w-screen -z-10" bind:this={canvas} />
