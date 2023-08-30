<script>
  import Board from "./components/board.svelte"
  import Room from "./components/room.svelte"
  /**
   * @property {boolean} roomPage - gives the boolean value
   */
  let roomPage = true

  /**
   * @property {boolean} gamePage - gives the boolean value
   */
  let gamePage = false
</script>

<main
  class="h-screen w-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1627389955646-6596047473d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')] bg-cover bg-center bg-no-repeat"
>
  {#if roomPage}
    <div class="h-full w-full">
      <Room bind:roomPage bind:gamePage />
    </div>
  {/if}
  {#if gamePage}
    <Board />
  {/if}
</main>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
