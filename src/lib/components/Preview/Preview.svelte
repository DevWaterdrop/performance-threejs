<script lang="ts">
	import { onMount } from 'svelte';
	import ThreePreview from '$lib/threejs/preview';

	export let images: HTMLImageElement[];
	export let previewSettings: PreviewSettings;

	let canvas: HTMLCanvasElement;
	let preview: ThreePreview;

	onMount(() => {
		preview = new ThreePreview({ canvas, images, previewSettings });
	});

	$: if (preview) {
		preview.previewSettings = previewSettings;
	}
</script>

<canvas class="fixed top-0 left-0 h-screen w-screen -z-10" bind:this={canvas} />
