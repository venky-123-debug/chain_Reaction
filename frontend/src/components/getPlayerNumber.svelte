<script>
  import { chain } from "../stores/chain"
  export let connFull
  let selectOption = $chain.numberOfPlayers
  const playerCountOptions = ["None", 2, 3, 4, 5, 6, 7, 8, 9, 10]

  const selectPlayerCount = (event) => {
    const selectedValue = event.target.value
    $chain.numberOfPlayers = selectedValue
  }
  $: if ($chain.numberOfPlayers == "None") {
    $chain.numberOfPlayers = undefined
  }
</script>

<div class="relative z-10 select-none" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="fixed inset-0 bg-gray-500 bg-opacity-5 backdrop-blur-md transition-opacity" />

  <div class="fixed inset-0 z-10 overflow-y-auto">
    <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
      <!-- <form action="" method="post" on:submit|preventDefault|stopPropagation> -->
      <div
        class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:w-full sm:max-w-sm sm:p-6"
      >
        <div>
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-300">
            <i class="fa-solid fa-user" />
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Number Of Players:</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">Please Enter Number of players.</p>
            </div>
          </div>
        </div>
        <div class="relative w-full">
          <select
            class="mt-3 w-full cursor-pointer rounded-md border border-[#a0a1a533] bg-transparent px-5 py-2 text-sm text-gray-800 placeholder:font-normal placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            bind:value={selectOption}
            on:change={selectPlayerCount}
          >
            {#each playerCountOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
          <div class="absolute right-3 top-4 items-center justify-center">
            <i class="fa-solid fa-chevron-down text-gray-800" />
          </div>
        </div>

        <div class="mt-5 flex sm:mt-6">
          <button
            type="button"
            on:click|preventDefault|stopPropagation
            disabled={!$chain.numberOfPlayers}
            class=" inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:cursor-not-allowed disabled:bg-opacity-20"
          >
            Set Number Of Players
          </button>
        </div>

        {#if connFull}
          <h4 class="w-full p-2 text-center text-sm font-bold text-red-600">{connFull}</h4>
        {/if}
      </div>
      <!-- </form> -->
    </div>
  </div>
</div>

<style>
  select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
</style>
