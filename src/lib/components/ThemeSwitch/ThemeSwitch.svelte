<script lang="ts">
	let isDark = false;

	const handleClick = () => {
		isDark = !isDark;
		const html = document.getElementsByTagName('html')[0];

		if (isDark) return html.classList.add('dark');
		return html.classList.remove('dark');
	};
</script>

<button class="border rounded-md px-2 py-1" on:click={handleClick}>Switch</button>
