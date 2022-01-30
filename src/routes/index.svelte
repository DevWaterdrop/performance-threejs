<script lang="ts">
	import Footer from '$lib/components/Footer/Footer.svelte';
	import Nav from '$lib/components/Nav/Nav.svelte';
	import Preview from '$lib/components/Preview/Preview.svelte';

	let img: HTMLImageElement;
	let isImgLoaded = false;

	$: if (img && img.complete) {
		isImgLoaded = true;
	}
</script>

<svelte:head>
	<title>Performance Threejs</title>
</svelte:head>

{#if isImgLoaded}
	<Preview images={[img]} />
{/if}
<div class="flex flex-col p-8 dark:text-white">
	<Nav />
	<div class="flex">
		<div class="relative w-2/5 flex flex-col">
			<img
				bind:this={img}
				class="w-full h-96 object-cover opacity-0"
				src="images/unsplash_image_smaller_80.jpg"
				alt="author - Sascha Bosshard, source: unsplash.com"
			/>
		</div>
		<div class="w-px mx-4 bg-black dark:bg-white" />
		<div class="w-3/5 flex flex-col gap-2">
			<div class="flex flex-col">
				<label for="effect">Effect</label>
				<input type="range" name="effect" />
				<span class="text-xs">Description</span>
			</div>
		</div>
	</div>
	<Footer />
</div>
