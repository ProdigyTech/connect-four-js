import Layout from "../components/Layouts";

import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import Modal from "../components/Winner";
import {
  GridState,
  GridState as GridStateObject,
  State,
  Winner,
} from "../util/types";

const lastRows = [35, 36, 37, 38, 39, 40, 41];
const indexColumnMap = {
  0: [0, 7, 14, 21, 28, 35],
  1: [1, 8, 15, 22, 29, 36],
  2: [2, 9, 16, 23, 30, 37],
  3: [3, 10, 17, 24, 31, 38],
  4: [4, 11, 18, 25, 32, 39],
  5: [5, 12, 19, 26, 33, 40],
  6: [6, 13, 20, 27, 34, 41],
};

const PLAYER_1 = "Player_1";
const PLAYER_2 = "Player_2";

const checkColumnRecursively: Boolean = (
  element: Number,
  array: [],
  moveBy: Number,
  counter: Number = 1
) => {
  const nextElement = element + moveBy;
  // counter is 4, we've had four consecutive hits.
  if (counter == 4) {
    return true;
  }

  if (!array.length > 0) {
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

const checkFourInARow = (
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

const checkWinConditions = (
  state: State,
  currentPlayer: String,
  callback: React.Dispatch<React.SetStateAction<Winner>>
) => {
  // vertical check
  if (checkFourInARow(state, currentPlayer, 7)) {
    callback({ player: currentPlayer, won: true });
    return true;
  }

  // horizontal check
  if (checkFourInARow(state, currentPlayer, 1)) {
    callback({ player: currentPlayer, won: true });
    return true;
  }

  // diag left & right
  if (
    checkFourInARow(state, currentPlayer, 6) ||
    checkFourInARow(state, currentPlayer, 8)
  ) {
    callback({ player: currentPlayer, won: true });
    return true;
  }
  return false;
};

export default function Home() {
  const [gridState, setGridState] = useState([]);
  const [player, setPlayer] = useState(PLAYER_1);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [winner, setWinner] = useState({ player: null, won: false });

  const resetGame = useCallback(() => {
    setGridState([]);
    setPlayer(PLAYER_1);
    setAnimationInProgress(false);
    setWinner({ player: null, won: false });
  }, []);

  // todo: rework this
  const findCellPlacement = useCallback(
    (initialPos: number) => {
      const moveBy = 7;

      let pos = null;

      let notFound = true;

      if (gridState.filter((g: GridState) => g.cell == initialPos).length > 0)
        return;

      let newPos = initialPos;

      while (notFound) {
        if (
          gridState.find(
            (item: GridStateObject) => item.cell == newPos + moveBy
          )
        ) {
          pos = newPos;
          notFound = false;
        } else {
          newPos = newPos + moveBy;
        }

        if (lastRows.includes(newPos)) {
          switch (newPos) {
            case 35:
              pos = 35;
              notFound = false;
              break;

            case 36:
              pos = 36;
              notFound = false;
              break;

            case 37:
              pos = 37;
              notFound = false;
              break;

            case 38:
              pos = 38;
              notFound = false;
              break;

            case 39:
              pos = 39;
              notFound = false;
              break;

            case 40:
              pos = 40;
              notFound = false;
              break;

            case 41:
              pos = 41;
              notFound = false;
              break;
          }
        }
      }

      return pos;
    },
    [gridState]
  );

  const animationPromise = useCallback(
    (iteration: Number, element: Number) => {
      return new Promise((resolve, _) => {
        setTimeout(() => {
          // add element to end of state array to start animation
          if (iteration == 0) {
            flushSync(() => {
              setGridState((g) => [...g, { cell: element, user: player }]);
              resolve();
            });
          } else {
            flushSync(() => {
              // remove the previous element from the animation, add new element to the array.
              // this simulates "dropping" the chip in the gameboard.
              setGridState((g) => {
                const lastElement = g[g.length - 1];
                const filtered = g.filter((e) => e.cell !== lastElement.cell);
                return [...filtered, { cell: element, user: player }];
              });
              resolve();
            });
          }
        }, 60);
      });
    },
    [player]
  );

  const onClickCell = useCallback(
    async (e: React.MouseEvent<HTMLElement>, i: number) => {
      flushSync(() => {
        setAnimationInProgress(true);
      });

      const finalPosition = findCellPlacement(i);

      if (finalPosition === undefined) {
        setAnimationInProgress(false);
        return;
      }

      const previousState = gridState;
      let iteration = 0;
      const associatedColumnIndexes = indexColumnMap[i];
      const unusedColumnIndexes = associatedColumnIndexes.filter(
        (d: Number) => !gridState.some((g: GridStateObject) => g.cell == d)
      );

      for (i of unusedColumnIndexes) {
        await animationPromise(iteration, i);
        iteration++;
      }

      const newGridState = [
        ...previousState,
        { cell: finalPosition, user: player },
      ];

      setGridState(newGridState);
      setAnimationInProgress(false);

      const didWin = checkWinConditions(newGridState, player, setWinner);

      if (!didWin) {
        player == PLAYER_1 ? setPlayer(PLAYER_2) : setPlayer(PLAYER_1);
      }
    },
    [gridState, player, findCellPlacement, animationPromise]
  );

  return (
    <>
      <h3>
        {" "}
        Current Player: <b>
          {player === PLAYER_1 ? "Player 1" : "Player 2"}
        </b>{" "}
      </h3>
      <Layout>
        {winner.won && <Modal player={player} onClick={resetGame} />}

        <div className="grid">
          {Array.from(new Array(42)).map((_, i) => {
            const gridData = gridState.find(
              (data: GridStateObject) => data.cell == i
            );
            return (
              <div
                className={`cell ${i}  ${
                  gridData ? `${gridData.user}` : "empty"
                }`}
                onClick={
                  animationInProgress
                    ? () => {
                        console.log("onClick blocked, animation in progress");
                      }
                    : (e) => i <= 7 && onClickCell(e, i)
                }
                key={i}
              ></div>
            );
          })}
        </div>
      </Layout>
    </>
  );
}
