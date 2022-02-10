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
		preview.PreviewSettings = previewSettings;
	}
</script>

<div class="fixed top-0 left-0 -z-10 h-screen w-screen" bind:this={container} />
