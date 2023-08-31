<script>
  import { chain } from "../stores/chain"
  import { afterUpdate } from "svelte"

  let playerIndex

  afterUpdate(async () => {
    if ($chain.winner) {
      playerIndex = await findPlayerIndex($chain.winner)
      console.log("playerIndex", playerIndex)
    }
  })

  const findPlayerIndex = (color) => {
    color = color.toString()
    return $chain.colors.findIndex((playerColor) => playerColor === color)
  }
</script>

{#if $chain.winningModal && $chain.winner}
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:w-full sm:max-w-sm sm:p-6"
        >
          <div>
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f7f7]">
              <i class="fa-solid fa-user" style="color:{$chain.winner}" />
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3
                class="text-base font-semibold leading-6 text-gray-900"
                id="modal-title"
                style="color: {$chain.winner};"
              >
                Player {playerIndex + 1} is the winner
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">Please Click on the button to restart the game.</p>
              </div>
            </div>
          </div>
          <div class="mt-5 flex items-center justify-center sm:mt-6">
            <button
              type="button"
              on:click
              class="inline-flex w-1/2 items-center justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              <i class="fa-solid fa-arrow-rotate-right" />
              &nbsp;Restart Game
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
