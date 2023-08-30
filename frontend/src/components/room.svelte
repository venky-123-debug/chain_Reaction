<script>
  import GetPlayer from "./getPlayerNumber.svelte"
  import { chain, generateRandomColorCodes } from "../stores/chain"

  // socket connection for the client
  import io from "socket.io-client"

  let noOfPlayer = false
  /**
   * @property {method} socket - one of the method in the io for the connection
   */
  //  const socket = io.connect("*")
  // const socket = io.connect("http://10.124.21.248:5000/")
  //  const socket = io.connect("http://192.168.34.108:5000/")
   const socket = io.connect("http://192.168.34.136:5000/")
  let ipAddress = ""
  /**
   * @property {boolean} roomCreate - gives the boolean value
   */
  let roomCreate = false

  /**
   * @property {String} roomId - gives the  roomId value
   */
  let roomId = ""

  /**
   * @property {Number} count - gives the count of the users
   */
  let count = 0
  /**
   * @property {String} roomIdValue - gives the ID and helps to show in the below the create button
   */
  let roomIdValue = ""

  /**
   * @property {boolean} btnDisable - its the disabled attribute for the create button
   */
  let btnDisable = false

  /**
   * @property {boolean} roomPage - gives the boolean value for the RoomPage
   */
  export let roomPage

  /**
   * @property {boolean} gamePage - gives the boolean value for the gamePage
   */
  export let gamePage

  /**
   *@type {String} connFull - gives the error if connection full
   */
  let connFull = ""

  let roomIdInput
  /**
   *  manage the click of the create room and generate the roon ID
   * @returns void
   */
  const createRoom = () => {
    console.log("game", gamePage)
    console.log("socket_Connection", socket.connected)
    console.log({ socket })
    roomCreate = true
    roomId = Math.floor(Math.random() * 9000 + 1000)
    btnDisable = true
    noOfPlayer = true
    console.log({ roomId })
  }

  $: console.log({ count })
  /**
   *  manage the click of the join room and validate the roon ID
   * @returns void
   */
  const joinRoom = () => {
    if (roomIdValue == roomId) {
      if (count < $chain.numberOfPlayers) {
        console.log("id matches and count is within limit")
        roomPage = false
        gamePage = true
        count++
        socket.emit("roomCreated", btnDisable, roomId, count)
      } else {
        connFull = "The room is full, Wait for the next turn!"
        console.log("room is full")
      }
    } else {
      connFull = "Please enter a valid room ID"
      console.log("Wrong ID")
    }

    if (count == 0) {
      connFull = "Please create a room ID"
    }
  }

  // socket connection for the background for the  processing of the event
  socket.on("roomCreated", (btnDisabled, roomCreatedKey, counts) => {
    btnDisable = btnDisabled
    roomId = roomCreatedKey
    count = counts
  })
  socket.on("player", (state) => {
    $chain = state
  })
  socket.on("connect", () => {
    console.log("server connected")
  })
  let showModal = false
  let ipError = ""

  // const connectToSocket = () => {
  //   if (!ipAddress) {
  //     connFull = "Please enter an IP address";
  //     return;
  //   }

  //   const socket = io.connect(`http://${ipAddress}:5000/`);

  //   socket.on("connect", () => {
  //     console.log("Connected to server");
  //  socket.emit("closeModal");
  //     // Close the modal after successful connection
  //     showModal = false;
  //   });
  //   $chain.ip=ipAddress

  // };

  const connectToSocket = () => {
    if (!ipAddress) {
      ipError = "Please enter an IP address"
      return
    }

    // Regular expression to validate IP address
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

    if (!ipRegex.test(ipAddress)) {
      ipError = "Invalid IP address format"
      return
    }

    const socket = io.connect(`http://${ipAddress}:5000/`)

    socket.on("connect", () => {
      console.log("Connected to server")
      socket.emit("closeModal")
      // Close the modal after successful connection
      showModal = false
    })

    $chain.ip = ipAddress
  }

  socket.on("closeModal", () => {
    showModal = false
  })

  // $: console.log("stores", $chain)
</script>

{#if noOfPlayer}
  <GetPlayer
    {connFull}
    on:click={() => {
      if ($chain.numberOfPlayers < 2) {
        connFull = "Number Of Players should be more than 1"
        return
      }
      if ($chain.numberOfPlayers > 10) {
        connFull = "Number Of Players should not be more than 10"
        return
      }

      if ($chain.numberOfPlayers) {
        $chain.colors = generateRandomColorCodes($chain.numberOfPlayers)
        socket.emit("player", $chain)
        noOfPlayer = false
      }
      roomIdInput.focus()
    }}
  />
{/if}

{#if showModal}
  <div
    class="h-screen w-screen overflow-hidden bg-[url('https://c4.wallpaperflare.com/wallpaper/914/746/419/abstract-digital-art-minimalism-simple-background-wallpaper-preview.jpg')] bg-cover bg-center bg-no-repeat"
  >
    <div class="fixed inset-0 flex items-center justify-center">
      <div class="m-6 w-full rounded-lg bg-white/60 p-8 shadow-lg sm:w-[50%] lg:w-[30%]">
        <form on:submit|stopPropagation|preventDefault={connectToSocket}>
          <h1 class="mb-6 text-center text-2xl font-semibold">
            <i class="fa-light fa-router fa-xl" />
            &nbsp;&nbsp;Connect to Socket
          </h1>
          <div class="mb-3 flex flex-col items-start gap-3 text-left md:flex-row md:items-center">
            <div class="w-full text-left text-gray-800 md:w-1/2 md:text-right">IP Address:</div>
            <input
              type="text"
              class="w-full rounded-md border border-gray-800/50 bg-transparent px-5 py-2 text-sm text-gray-800 placeholder:font-normal placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:w-1/2"
              placeholder="E.g:192.168.34.136"
              bind:value={ipAddress}
              on:input={() => {
                ipError = ""
              }}
            />
          </div>
          <div class="flex justify-end">
            <button
              type="submit"
              disabled={!ipAddress}
              class="rounded-md bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-opacity-20"
            >
              <i class="fa-light fa-link" />
              &nbsp;Connect
            </button>
          </div>
          {#if ipError}
            <h4 class="mt-3 w-full p-2 text-center text-sm font-bold text-red-600">{ipError}</h4>
          {/if}
        </form>
      </div>
    </div>
  </div>
{:else}
  <div class="relative flex h-full w-full select-none items-center justify-center">
    <div class="m-6 w-full rounded-lg bg-white/60 p-8 shadow-lg sm:w-[50%] lg:w-[40%]">
      <form on:submit|preventDefault|stopPropagation={joinRoom}>
        <h1 class="mb-12 text-center text-2xl font-semibold">
          <i class="fa-solid fa-house-medical-circle-check" />
          &nbsp;Create Room
        </h1>

        {#if $chain.numberOfPlayers}
          <div class="mb-3 flex flex-col items-start gap-3 text-left md:flex-row md:items-center">
            <div class="w-full text-left text-gray-800 md:w-1/2 md:text-right">Number Of Players:</div>
            <input
              type="text"
              readOnly
              class="w-full rounded-md border border-gray-800/50 bg-transparent px-5 py-2 text-sm text-gray-800 placeholder:font-normal placeholder:text-gray-400 read-only:cursor-not-allowed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed md:w-1/2"
              placeholder="Enter room Id"
              value={$chain.numberOfPlayers}
            />
          </div>
        {/if}

        <div class="mb-3 flex flex-col items-start gap-3 text-left md:flex-row md:items-center">
          <div class="w-full text-left text-gray-800 md:w-1/2 md:text-right">Room ID:</div>
          <input
            type="number"
            bind:this={roomIdInput}
            class="w-full rounded-md border border-gray-800/50 bg-transparent px-5 py-2 text-sm text-gray-800 placeholder:font-normal placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed md:w-1/2"
            placeholder="Enter room Id"
            bind:value={roomIdValue}
          />
        </div>
        <div class="mb-4 flex flex-col items-center justify-center gap-3 lg:flex-row">
          <button
            type="button"
            class="w-full rounded-md bg-blue-500 p-2 font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-opacity-20"
            disabled={btnDisable}
            on:click={createRoom}
          >
            <i class="fa-light fa-game-board" />
            &nbsp;Create RoomId
          </button>
          <button
            type="submit"
            class="w-full rounded-md bg-green-500 p-2 font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-200"
          >
            <i class="fa-solid fa-plus" />
            &nbsp;Join Room
          </button>
        </div>
        {#if roomCreate}
          <h3 class=" mt-3 w-full p-2 text-center text-sm font-bold text-gray-800">Room id {roomId} generated</h3>
        {/if}
        {#if connFull && connFull != "Number Of Players should be more than 1"}
          <h4 class="w-full p-2 text-center text-sm font-bold text-red-600">{connFull}</h4>
        {/if}
      </form>
    </div>
  </div>
{/if}

<style>
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
