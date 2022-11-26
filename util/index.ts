import {
  GridState as GridStateObject,
  State,
  Winner,
} from "./types/types";

export const lastRows: Array<Number> = [35, 36, 37, 38, 39, 40, 41];
export const indexColumnMap = {
  0: [0, 7, 14, 21, 28, 35],
  1: [1, 8, 15, 22, 29, 36],
  2: [2, 9, 16, 23, 30, 37],
  3: [3, 10, 17, 24, 31, 38],
  4: [4, 11, 18, 25, 32, 39],
  5: [5, 12, 19, 26, 33, 40],
  6: [6, 13, 20, 27, 34, 41],
};

export const PLAYER_1: String = "Player_1";
export const PLAYER_2: String = "Player_2";

export const checkColumnRecursively: boolean = (
  element: number,
  array: Array<number>,
  moveBy: number,
  counter: number = 1
) => {
  const nextElement: number = element + moveBy;
  // counter is 4, we've had four consecutive hits.
  if (counter == 4) {
    return true;
  }


  if (!array.length) {
    return false;
  }

  // check the array for next next element. if it exists, increment the counter, remove the next element
  // from the array and call the function again.
  if (array.includes(nextElement)) {
    counter = counter + 1;
    array.shift();
    return checkColumnRecursively(nextElement, array, moveBy, counter);
  } else {
    return false;
  }
};

export const checkFourInARow = (
  state: State,
  currentPlayer: String,
  moveBy: Number
) => {
  let won = false;
  const currentUserGameState: State = state.filter(
    (s: GridStateObject) => s.user === currentPlayer
  );

  if (currentUserGameState.length < 4) {
    return false;
  }

  const currentUserBoardPositions: Array<Number> = currentUserGameState
    .map(({ cell }) => cell)
    .sort((a, b) => a - b);

  if (currentUserBoardPositions.length < 4) {
    return false;
  }

  // elements are sorted
  // check one element, see if there is one x spaces away
  // if x spaces away, then grab that element and check to see if there is another one x spaces away(recursion)
  // if not x spaces, keep going

  currentUserBoardPositions.forEach((element) => {
    const winConditionMet = checkColumnRecursively(
      element,
      [...currentUserBoardPositions],
      moveBy
    );
    if (winConditionMet) {
      won = true;
      return;
    }
  });

  return won;
};

export const checkWinConditions = (
  state: State,
  currentPlayer: String,
) => {
  // vertical check
  if (checkFourInARow(state, currentPlayer, 7)) {
    return { player: currentPlayer, won: true }

  }

  // horizontal check
  if (checkFourInARow(state, currentPlayer, 1)) {
    return { player: currentPlayer, won: true };

  }

  // diag left & right
  if (
    checkFourInARow(state, currentPlayer, 6) ||
    checkFourInARow(state, currentPlayer, 8)
  ) {
    return { player: currentPlayer, won: true };

  }
  return { player: null, won: false };
};
