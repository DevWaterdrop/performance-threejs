<script>
	import Nav from '$lib/components/Nav/Nav.svelte';
</script>

<svelte:head>
	<title>Performance Threejs</title>
</svelte:head>

<div class="flex flex-col p-8 dark:text-white">
	<Nav />
	<div class="flex">
		<div class="relative w-2/5 flex flex-col">
			<img
				class="w-full object-contain"
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
</div>
