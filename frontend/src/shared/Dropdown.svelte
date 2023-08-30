<script>
  import { createEventDispatcher } from "svelte"
  export let options = []
  export let value

  const dispatch = createEventDispatcher()

  let isOpen = false

  function toggleDropdown() {
    isOpen = !isOpen
  }

  function selectOption(option) {
    value = option
    dispatch("change", value)
    isOpen = false
  }
</script>

<div class="relative mt-3 w-full rounded-md border border-[#a0a1a533] bg-transparent text-sm text-gray-800">
  <div class="relative">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="flex items-center justify-between" on:click={toggleDropdown}>
      <span>{value}</span>
      <i class="fas fa-chevron-down text-gray-500" />
    </div>
    {#if isOpen}
      <div class="absolute left-0 top-full mt-1 w-full rounded-md border border-[#a0a1a533] bg-white shadow-md">
        {#each options as option}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="cursor-pointer px-4 py-2 hover:bg-gray-100" on:click={() => selectOption(option)}>
            {option}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .fas {
    font-size: 0.75rem;
  }
</style>
