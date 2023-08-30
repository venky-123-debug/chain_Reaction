import { writable } from "svelte/store"

/**
 * A writable Svelte store representing the game chain.
 * @typedef {import("svelte/store").Writable} Writable
 * @typedef {Object} ChainStore
 * @property {number} rows - The number of rows in the game board.
 * @property {number} columns - The number of columns in the game board.
 * @property {number[][]} boardArr - The 2D array representing the initial game board.
 * @property {number[][]} actualArr - The 2D array representing the current state of the game board.
 * @property {Array<string>} colors - The color(s) used in the game.
 * @property {boolean} gameFinish - Indicates whether the game has finished.
 * @property {boolean} click - Indicates if clicking is allowed.
 * @property {string} winner - The winner of the game.
 * @property {boolean} gameEnd - Indicates if the game has ended.
 * @property {string} numberOfPlayers - Number of players.
 * @property {string} currentPlayer - Name of current player.
 * @property {boolean} winningModal - To display winningModal.
 * @property {string} timerMsg - Timer message after 5 seconds of inactive player.
 * @property {Number} timer - Name timer to display time remaining for currentPlayer.
 */

/**
 * Create a writable store representing the game chain.
 * @type {Writable<ChainStore>}
 */
export const chain = writable({
  rows: 16,
  columns: 16,
  boardArr: Array(16)
    .fill()
    .map(() => Array(24).fill(0)),
  actualArr: Array(16)
    .fill()
    .map(() => Array(24).fill(0)),
  // colors: "#e28743",
  colors: [],
  gameFinish: false,
  click: true,
  winner: "",
  gameEnd: true,
  numberOfPlayers: undefined,
  currentPlayer: undefined,
  winningModal: false,
  timer: 20,
  timerMsg: undefined
});

/**
 * Calculate the Euclidean color difference between two color codes.
 *
 * @param {string} color1 - The first color code (#RRGGBB format).
 * @param {string} color2 - The second color code (#RRGGBB format).
 * @returns {number} The Euclidean color difference between the two colors.
 */
const calculateColorDifference = (color1, color2) => {
  const r = (parseInt(color1.substring(1, 3), 16) - parseInt(color2.substring(1, 3), 16)) ** 2;
  const g = (parseInt(color1.substring(3, 5), 16) - parseInt(color2.substring(3, 5), 16)) ** 2;
  const b = (parseInt(color1.substring(5, 7), 16) - parseInt(color2.substring(5, 7), 16)) ** 2;
  return Math.sqrt(r + g + b);
};

/**
 * Generate an array of random dark color codes.
 *
 * @param {number} numColors - The number of random dark color codes to generate.
 * @returns {string[]} An array of unique random dark color codes.
 */
// The value 8355711 corresponds to the hexadecimal color code #7F7F7F, which represents a mid-gray color. 
export const generateRandomColorCodes = (numColors) => {
  const colorCodes = [];

  while (colorCodes.length < numColors) {
    const randomColor = '#' + Math.floor(Math.random() * 8355711).toString(16); // Generating dark colors with brightness < 50%
    if (!colorCodes.some(color => calculateColorDifference(randomColor, color) < 100)) {
      colorCodes.push(randomColor);
    }
  }

  chain.update(chainState => ({ ...chainState, colors: colorCodes }));
  return colorCodes;
};




