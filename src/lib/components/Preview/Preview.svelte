<script lang="ts">
	import type { PreviewSettings } from '$lib/types';
	import { onMount } from 'svelte';
	import ThreePreview from '$lib/threejs/preview';

	export let images: HTMLImageElement[];
	export let previewSettings: PreviewSettings;

	let container: HTMLDivElement;
	let preview: ThreePreview;

	onMount(() => {
		preview = new ThreePreview({ container, images, previewSettings });

		return preview.cleanUp();
	});

	$: if (preview) {
		preview.previewSettings = previewSettings;
	}
</script>

<div class="absolute top-0 left-0 h-full w-full -z-10" bind:this={container} />
