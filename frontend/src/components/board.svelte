<script>
  import { chain } from "../stores/chain"
  import Reaction from "./reaction.svelte"
  import io from "socket.io-client"
  import { onMount, afterUpdate } from "svelte"
  import WinningModal from "./winning_modal.svelte"

  // Establish a connection with the Socket.IO server
  // const socket = io.connect("*");
  // const socket = io.connect("http://192.168.34.108:5000/")
  const socket = io.connect("http://10.124.21.248:5000/")
  // const socket = io.connect("http://192.168.34.136:5000/")

  //  const socket = io.connect(`http://${$chain.ip}:5000/`)

  let boards = [...$chain.boardArr]

  let MAX_EXECUTION_TIME = 20000
  // let currentPlayerIndex = 0;
  // let timer = MAX_EXECUTION_TIME / 1000; // Initial timer value in seconds
  // let prevPlayer;
  let timerInterval

  // console.log("winner_No", $chain.colors[$chain.currentPlayer])
  onMount(() => {
    $chain.timer = MAX_EXECUTION_TIME / 1000 // Initial timer value in seconds
    if (timerInterval) {
      clearInterval(timerInterval)
    }
    // Start the timer countdown
    startTimer()
  })
  boards = [...$chain.boardArr]
  // Function to handle receiving updated game state from the server
  socket.on("restart", (state) => {
    // Update the game state in the store
    $chain = state
  })
  // socket.on("player", (state) => {
  //   // Update the game state in the store
  //   $chain = state;
  // });

  const startTimer = () => {
    timerInterval = setInterval(() => {
      if ($chain.timer > 0) {
        console.log("timer started")
        $chain.timer -= 1
      } else {
        // Timer has reached 0, perform actions here if needed
        clearInterval(timerInterval)
        // For example, show a message or trigger an event
      }
    }, 1000)
  }

  const stopTimer = () => {
    clearInterval(timerInterval)
  }

  afterUpdate(() => {
    // Handle restarting the timer if needed
    if ($chain.gameEnd && !timerInterval) {
      startTimer()
    }

    // Clear the interval when the component is unmounted
    return () => {
      stopTimer()
    }
  })

  // Restart the game
  const restartGame = () => {
    let newgame = {
      rows: 16,
      columns: 16,
      boardArr: Array(16)
        .fill()
        .map(() => Array(24).fill(0)),
      actualArr: Array(16)
        .fill()
        .map(() => Array(24).fill(0)),
      // colors: "#e28743",
      colors: $chain.colors,
      numberOfPlayers: $chain.numberOfPlayers,
      // currentPlayer: $chain.currentPlayer,
      currentPlayer: $chain.colors[0],
      gameFinish: false,
      click: true,
      winner: "",
      gameEnd: true,
      winningModal: false,
      timer: 20,
      timerMsg: undefined,
    }
    $chain = newgame
    // startTimer()
    console.log("chainRestart", $chain)
    socket.emit("restart", $chain) // Emit restart signal to the server

    // socket.emit("player", $chain);
  }

  $: console.log("current_player_board", $chain.currentPlayer)
</script>

<WinningModal on:click={restartGame} />

{#if $chain.gameEnd}
  <div class="relative flex h-full w-full flex-col items-center justify-center bg-white/90">
    <div class="mb-3 flex w-[70%] items-center justify-between">
      <p class="text-base font-semibold" style="color:{$chain.currentPlayer};">
        Player {$chain.colors.indexOf($chain.currentPlayer) + 1} turn
      </p>
      <p class="text-base font-semibold" style="color:{$chain.currentPlayer};">
        Time remaining: {$chain.timer} seconds
      </p>
    </div>
    <!-- <h4 class:hidden={!displayTimeError} class="text-center w-full p-2 text-red-600 text-sm font-bold">{displayTimeError}</h4> -->
    <div class="h-[80%] w-[70%] bg-transparent">
      <div class=" col-span-1 grid h-full w-full grid-cols-16 gap-1 p-1">
        {#each boards as boardrow, row}
          {#each boardrow as boardcol, col}
            <Reaction {socket} {row} {col} />
          {/each}
        {/each}
      </div>
    </div>

    <h4 class:hidden={!$chain.timerMsg} class="absolute bottom-5 w-full p-2 text-center text-sm font-bold text-red-600">
      {$chain.timerMsg}
    </h4>
  </div>
  <!-- {:else}
<WinningModal on:click={restartGame}/> -->
{/if}
