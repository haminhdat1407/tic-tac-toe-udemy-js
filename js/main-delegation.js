/**
 * Global variables
 */
import { checkGameStatus } from './utils.js';
import {
  getCellElementAtIdx,
  getCellElementList,
  getCellListElement,
  getCurrentTurnElement,
  getGameStatusElement,
  getReplayButtonElement,
} from './selectors.js';
import { CELL_VALUE, GAME_STATUS, TURN } from './constants.js';

let currentTurn = TURN.CROSS;
let gameStatus = GAME_STATUS.PLAYING;
let isGameEnded = false;
let cellValues = new Array(9).fill('');
function toggleTurn() {
  //toggle turn
  currentTurn = currentTurn === TURN.CIRCLE ? TURN.CROSS : TURN.CIRCLE;
  //update turn on DOM Element
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(currentTurn);
  }
}
function updateGameStatus(newGameSatus) {
  gameStatus = newGameSatus;
  const gameStatusElement = getGameStatusElement();
  if (gameStatusElement) gameStatusElement.textContent = newGameSatus;
}
function showReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) replayButton.classList.add('show');
}
function hideReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) replayButton.classList.remove('show');
}
function highlightWinCells(winPositions) {
  if (!Array.isArray(winPositions) || winPositions.length !== 3) {
    throw new Error('Invalid win positions');
  }
  for (const position of winPositions) {
    const cell = getCellElementAtIdx(position);
    if (cell) cell.classList.add('win');
  }
}
function handleCellclick(cell, index) {
  const isClicked = cell.classList.contains(TURN.CIRCLE) || cell.classList.contains(TURN.CROSS);
  const isEndGame = gameStatus !== GAME_STATUS.PLAYING;

  //only allow to click if game is playing and that cerll is not clicked yet
  if (isClicked || isEndGame) return;

  //set select cell
  cell.classList.add(currentTurn);

  //update cellValues
  cellValues[index] = currentTurn === TURN.CIRCLE ? CELL_VALUE.CIRCLE : CELL_VALUE.CROSS;

  //togle turn
  toggleTurn();

  //check game status
  const game = checkGameStatus(cellValues);
  switch (game.status) {
    case GAME_STATUS.ENDED: {
      updateGameStatus(game.status);
      showReplayButton();
      break;
    }
    case GAME_STATUS.X_WIN:
    case GAME_STATUS.O_WIN: {
      updateGameStatus(game.status);
      showReplayButton();
      highlightWinCells(game.winPositions);
      break;
    }
    default:
      break;
  }
}
function initCellElementList() {
  // set index for element
  const liList = getCellElementList();
  liList.forEach((cell, index) => {
    // cell.addEventListener('click', () => handleCellclick(cell, index));
    cell.dataset.idx = index;
  });
  //-------
  const ulElement = getCellListElement();
  if (ulElement) {
    ulElement.addEventListener('click', (e) => {
      if (e.target.tagName !== 'LI') return;
      const index = Number.parseInt(e.target.dataset.idx);
      handleCellclick(e.target, index);
    });
  }
}
function resetGame() {
  console.log('click button replay');

  //reset temp global
  currentTurn = TURN.CROSS;
  gameStatus = GAME_STATUS.PLAYING;
  cellValues = cellValues.map(() => '');
  //reset DOM elements
  //reset game status
  updateGameStatus(GAME_STATUS.PLAYING);
  //reset current turn
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(TURN.CROSS);
    //reset game board
    const cellElementList = getCellElementList();
    for (const cellElement of cellElementList) {
      cellElement.className = '';
    }
    //hide replay button
    hideReplayButton();
  }
}
function initReplayButton() {
  const replayButton = getReplayButtonElement();

  if (replayButton) {
    replayButton.addEventListener('click', resetGame);
  }
}
/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */
(() => {
  //bind click event for all li elements
  initCellElementList();

  //bind click event for replay button
  initReplayButton();
})();
