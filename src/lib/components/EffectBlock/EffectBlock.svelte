<div class="flex w-full flex-col gap-2 p-2 border border-black dark:border-white">
	<div class="flex flex-col">
		<span class="font-semibold"><slot name="name" /></span>
		<slot name="underName" />
	</div>
	{#if $$slots.middle}
		<div class="flex flex-col gap-1">
			<slot name="middle" />
		</div>
	{/if}
	<span class="text-xs"><slot name="description" /></span>
</div>
