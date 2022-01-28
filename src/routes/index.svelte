<script>
	import Nav from '$lib/components/Nav/Nav.svelte';
</script>

<svelte:head>
	<title>Performance Threejs</title>
</svelte:head>

<div class="flex flex-col p-8 dark:text-white">
	<Nav />
	<div class="flex divide-x">
		<div class="w-2/5 flex">
			<h2 class="text-lg">Preview</h2>
		</div>
		<div class="w-3/5 flex flex-col gap-2 p-4">
			<div class="flex flex-col">
				<label for="effect">Effect</label>
				<input type="range" name="effect" />
				<span class="text-xs">Description</span>
			</div>
		</div>
	</div>
</div>
