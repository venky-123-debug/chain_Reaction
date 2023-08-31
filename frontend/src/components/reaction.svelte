<script>
  import { chain } from "../stores/chain"
  import { onMount, afterUpdate } from "svelte"
  import { fly } from "svelte/transition"

  /**
   * @type {Number} row -  gives the rows of the Array
   */
  export let row

  /**
   * @type {Number} col -  gives the rows of the Array
   */
  export let col

  /**
   * @property {method} socket - one of the method in the io for the connection
   */
  export let socket

  /**
   * @property {Array} cells -  its for storing the value of the each clicked cell
   */
  let cells = [...$chain.boardArr]

  /**
   * @property {Array} owner -  its for storing the value of the each clicked cell color to refeclt on it.
   */
  let owner = [...$chain.actualArr]

  /**
   * @type {boolean} isBurst - checing for the burst conditions
   */
  let isBurst = false

  /**
   * @type {String} winner - stores the color of the winner
   */
  let winner

  //  $chain.actualArr[row][col]= $chain.currentPlayer? $chain.currentPlayer: $chain.colors[0]
  onMount(() => {
    if (!$chain.currentPlayer) $chain.currentPlayer = $chain.colors[0]
  })

  afterUpdate(() => {
    if (!$chain.winningModal) {
      if ($chain.timer === 0) {
        console.log("10 seconds completed")

        // Select a random valid row and column for the click
        const randomRow = Math.floor(Math.random() * 16)
        const randomCol = Math.floor(Math.random() * 24)

        // Ensure that the selected cell is valid before triggering the click
        if (isValidCell(randomRow, randomCol)) {
          clickCell(randomRow, randomCol)
        }
      }
    }
  })

  /**
   * manage the click of the each cell
   * @param {Number} row - gives the current row of the board
   * @param  {Number} col - gives the current column of the board
   */
  const clickCell = (row, col) => {
    console.log("clickCell called:", row, col)
    // Reset timer and message
    $chain.timer = 20
    $chain.click = true
    // $chain.timerMsg = undefined;

    if (cells[row][col] !== 0 && owner[row][col] !== $chain.currentPlayer) {
      return
    }
    console.log("clickCell_update", $chain.click)

    if ($chain.click) {
      cells[row][col]++
      owner[row][col] = $chain.currentPlayer

      if (cells[row][col] === maxLimit(row, col)) {
        cells[row][col] = 0
        $chain.actualArr[row][col] = ""
        burst(row, col)
      }

      // Update the current player
      let currentPlayerIndex = $chain.colors.indexOf($chain.currentPlayer)
      let nextPlayerIndex = (currentPlayerIndex + 1) % $chain.colors.length
      $chain.currentPlayer = $chain.colors[nextPlayerIndex]

      // Update the actualArr
      $chain.actualArr = [...owner]
      socket.emit("player", $chain)

      // $chain.click = false;
    }

    if (checkWin()) {
      setTimeout(() => {
        $chain.gameEnd = false
        $chain.winner = winner
        $chain.click = false
        $chain.winningModal = true

        socket.emit("player", $chain)
        console.log("Modal Shows", $chain.winningModal)
        console.log("winner:", winner)
      }, 500)
    }

    socket.emit("player", $chain)
  }
  /**
   * splitting condition of the cell
   * @param {Number} row - gives the current row of the board
   * @param  {Number} col - gives the current col of the board
   */
  const maxLimit = (row, col) => {
    // Check for the corner case
    // console.log(cells[row].length);
    // console.log(cells[col].length);
    if ((row == 0 || row == 15) && (col == 0 || col == 23)) {
      return 2
    }
    // Check for the border case
    else if (
      (row == 0 && col > 0 && col < 23) ||
      (col == 0 && row > 0 && row < 15) ||
      (row == 15 && col > 0 && col < 23) ||
      (col == 23 && row > 0 && row < 15)
    ) {
      // $chain.actualArr[row][col]="";
      return 3
    }

    // Check for the centre case
    else {
      // $chain.actualArr[row][col]="";
      return 4
    }
  }

  /**
   * making the explosion in the board
   * @param {Number} row - gives the current row of the board
   * @param  {Number} col - gives the current col of the board
   */

  const burst = (row, col) => {
    isBurst = true
    const currentPlayerColor = $chain.currentPlayer

    const directions = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 }, // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 }, // Right
    ]

    directions.forEach((direction) => {
      const newRow = row + direction.row
      const newCol = col + direction.col

      if (isValidCell(newRow, newCol)) {
        cells[newRow][newCol]++
        if (cells[newRow][newCol] === maxLimit(newRow, newCol)) {
          cells[newRow][newCol] = 0
          $chain.actualArr[newRow][newCol] = ""
          burst(newRow, newCol)
        }
        owner[newRow][newCol] = currentPlayerColor
      }
    })
  }

  /**
   * fnction to check valid box to place atom
   * @param row - row id of the board
   * @param col - column id of the board
   */
  const isValidCell = (row, col) => {
    return row >= 0 && row < 16 && col >= 0 && col < 24
  }

  // afterUpdate

  /**
   * checking the winning conditions
   */
  const checkWin = () => {
    if (!isBurst) {
      return false
    }
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 24; j++) {
        if (owner[i][j] == 0) {
          continue
        }
        if (!winner) {
          winner = $chain.actualArr[i][j]
          continue
        }
        if (winner != $chain.actualArr[i][j]) {
          return false
        }
      }
    }

    return true
  }

  socket.on("player", (state) => {
    $chain = state
    cells = [...$chain.boardArr]
    owner = [...$chain.actualArr]
    winner = $chain.winner
  })

  socket.on("winner", (state) => {
    winner = state
  })

  /**
   * Check if a cell is a corner.
   */
  const isCorner = (row, col) => {
    return (
      (row === 0 && col === 0) || (row === 0 && col === 23) || (row === 15 && col === 0) || (row === 15 && col === 23)
    )
  }

  /**
   * Check if a cell is on a side (but not a corner).
   */
  const isSide = (row, col) => {
    return (row === 0 || row === 15 || col === 0 || col === 23) && !isCorner(row, col)
  }

  /**
   * Check if a cell is at the center of the grid.
   * Excluding sides and corners.
   */
  const isCenter = (row, col) => {
    return row > 0 && row < 15 && col > 0 && col < 23
  }

  /**
   * Get the appropriate animation class based on sphere's position.
   */
  // const getAnimationClass = (row, col) => {
  //   if (isCorner(row, col)) {
  //     return "animate-spin-corner"
  //   } else if (isSide(row, col)) {
  //     return "animate-spin-side"
  //   } else if (isCenter(row, col)) {
  //     return "animate-spin-center"
  //   } else {
  //     return "" // No animation class for other positions
  //   }
  // }
  /**
   * Get the appropriate animation class based on sphere's position.
   */
  const getAnimationClass = (row, col) => {
    if (isCorner(row, col)) {
      return "animate-spin-corner" // Apply animation class to corners
    } else if (isTwoInBoxOnSide(row, col)) {
      return "animate-spin-side" // Apply animation class when two spheres are in a box on sides
    } else if (isThreeInBox(row, col)) {
      return "animate-spin-center" // Apply animation class when three spheres are in a box
    } else {
      return "" // No animation class for other positions
    }
  }
  // Helper function to check if two spheres are in a box on sides (excluding corners)
  const isTwoInBoxOnSide = (row, col) => {
    // Check if the cell is on the sides but not a corner
    if (isSide(row, col) && !isCorner(row, col)) {
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ]

      let sphereCount = 0
      for (const [nRow, nCol] of neighbors) {
        if (isValidCell(nRow, nCol) && cells[nRow][nCol] > 0) {
          sphereCount++
        }
      }

      return sphereCount === 2 // Apply animation class if two spheres are present
    }

    return false
  }

  // Helper function to check if three spheres are in a box
  const isThreeInBox = (row, col) => {
    // Check if the cell is not on corners or sides
    if (!isCorner(row, col) && !isSide(row, col)) {
      // Check for the presence of three spheres in the box
      if (row > 0 && row < 15 && col > 0 && col < 23) {
        // Check the positions of neighboring cells
        const neighbors = [
          [row - 1, col],
          [row + 1, col],
          [row, col - 1],
          [row, col + 1],
        ]

        let sphereCount = 0
        for (const [nRow, nCol] of neighbors) {
          if (isValidCell(nRow, nCol) && cells[nRow][nCol] > 0) {
            sphereCount++
          }
        }

        return sphereCount === 3 // Apply animation class if three spheres are present
      }
    }

    return false
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="relative flex cursor-pointer items-center justify-center rounded-md border"
  style="border-color: {$chain.currentPlayer};"
  on:click={() => clickCell(row, col)}
>
  <!-- <div class="flex h-6 w-6 items-center justify-center">
    {#if cells[row][col] > 0 && cells[row][col] <= 4}
      {#each Array(cells[row][col]) as _, index}
        <div
          class="flex h-[10px] w-[15px] animate-spin items-center justify-center rounded-full"
          style="background-color:  {$chain.actualArr[row][col]}; "
        />
      {/each}
    {/if}
  </div> -->

  <!-- <div class="flex h-6 w-6 items-center justify-center">
    {#if cells[row][col] > 0 && cells[row][col] <= 4}
      {#each Array(cells[row][col]) as _, index}
        {#if cells[row][col] === 1 && (isCorner(row, col) || isCenter(row, col))}
          <div
            in:fly={{ delay: 10 * index }}
            class="flex h-[10px] w-[15px] animate-spin items-center justify-center rounded-full"
            style="background-color:  {$chain.actualArr[row][col]}; "
          />
        {:else if cells[row][col] === 2 && isSide(row, col)}
          <div
            in:fly={{ x: 30 * (index === 0 ? -1 : 1), delay: 10 * index }}
            class="flex h-[10px] w-[15px] animate-spin items-center justify-center rounded-full"
            style="background-color:  {$chain.actualArr[row][col]}; "
          />
        {:else if cells[row][col] === 3}
          <div
            in:fly={{ x: 30 * (index - 1), delay: 10 * index }}
            class="flex h-[10px] w-[15px] animate-spin items-center justify-center rounded-full"
            style="background-color:  {$chain.actualArr[row][col]}; "
          />
        {:else}
          <div
            class="flex h-[10px] w-[15px] animate-spin items-center justify-center rounded-full"
            style="background-color:  {$chain.actualArr[row][col]}; "
          />
        {/if}
      {/each}
    {/if}
  </div> -->
  <div class="flex h-6 w-6 items-center justify-center">
    {#if cells[row][col] > 0 && cells[row][col] <= 4}
      {#each Array(cells[row][col]) as _, index}
        <div
          class={"flex h-[10px] w-[15px] items-center justify-center rounded-full " + getAnimationClass(row, col)}
          style="background-color: {$chain.actualArr[row][col]};"
        />
      {/each}
    {/if}
  </div>
</div>

<style>
  .animate-spin-corner {
    animation: spin-corner 1s linear infinite;
  }

  .animate-spin-side {
    animation: spin-side 1s linear infinite;
  }

  .animate-spin-center {
    animation: spin-center 1s linear infinite;
  }

  @keyframes spin-corner {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-side {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-center {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
