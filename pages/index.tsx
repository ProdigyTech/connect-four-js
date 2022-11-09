import Layout from "../components/Layouts";

import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import Modal from "../components/Winner";

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

const checkColumnRecursively = (element, array, moveBy, counter = 0) => {
  array.shift();
  const nextElement = element + moveBy;

  // counter is 4, we've had four consecutive hits.
  if (counter == 4) {
    return true;
  }

  console.log("counter", counter)

  if (array.length > 0) {
    if (array.includes(nextElement)) {
      counter = counter + 1;
      return checkColumnRecursively(nextElement, array, moveBy, counter);
    } else {
      return false;
    }
  } else {
    return true;
  }
};

const checkFourInARow = (state, currentPlayer, moveBy) => {
  let won = false;
  const filteredSate = state.filter((s) => s.user === currentPlayer);

  if (filteredSate.length < 4) {
    return false;
  }

  const justPositions = filteredSate
    .map(({ cell }) => cell)
    .sort((a, b) => a - b);

  if (justPositions.length < 4) {
    return false;
  }

  console.log(justPositions);

  // elements are sorted
  // check one element, see if there is on 7 spaces away
  // if 7 spaces away, then grab that element and check to see if there is another one 7 spaces away(recursion)
  // if not 7 spaces, keep going

  justPositions.forEach((element) => {
    const winConditionMet = checkColumnRecursively(
      element,
      [...justPositions],
      moveBy
    );
    if (winConditionMet) {
      console.log("win condition met!");
      won = true;
      return;
    }
  });

  return won;
};

const checkWinConditions = (state, currentPlayer, callback) => {
  const checkVerticalWin = checkFourInARow(state, currentPlayer, 7);

  if (checkVerticalWin) {
    callback({ player: currentPlayer, won: true });
    return;
  }

  const checkHorizontalWin = checkFourInARow(state, currentPlayer, 1);

  if (checkHorizontalWin) {
    callback({ player: currentPlayer, won: true });
    return;
  }
};

export default function Home() {
  const [gridState, setGridState] = useState([]);
  const [player, setPlayer] = useState(PLAYER_1);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [winner, setWinner] = useState({ player: null, won: false });

  // todo: rework this
  const findCellPlacement = (initialPos: Number) => {
    const moveBy = 7;
    let previous = initialPos;
    let pos = null;

    let notFound = true;

    if (gridState.filter((g) => g.cell == initialPos).length > 0) return;

    let newPos = initialPos;

    while (notFound) {
      if (gridState.find((item) => item.cell == newPos + moveBy)) {
        pos = newPos;
        notFound = false;
      } else {
        previous = newPos;
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
  };

  // todo rename this
  const thing = (iteration, element) => {
    return new Promise((resolve, reject) => {
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
      }, 50);
    });
  };

  const onClickCell = async (e: React.MouseEvent<HTMLElement>, i: Number) => {
    flushSync(() => {
      setAnimationInProgress(true);
    });
    const finalPosition = findCellPlacement(i);
    const previousState = gridState;
    let iteration = 0;
    const associatedColumnIndexes = indexColumnMap[i];
    const unusedColumnIndexes = associatedColumnIndexes.filter(
      (d) => !gridState.some((g) => g.cell == d)
    );

    for (i of unusedColumnIndexes) {
      await thing(iteration, i);
      iteration++;
    }

    const newGridState = [
      ...previousState,
      { cell: finalPosition, user: player },
    ];
    setGridState(newGridState);
    setAnimationInProgress(false);

    player == PLAYER_1 ? setPlayer(PLAYER_2) : setPlayer(PLAYER_1);

    checkWinConditions(newGridState, player, setWinner);
  };

  return (
    <Layout>
      {winner.won && <Modal player={player} />}
      <div className="score-left"></div>
      <div className="grid">
        {Array.from(new Array(42)).map((_, i) => {
          const gridData = gridState.find((data) => data.cell == i);
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
      <div className="score-right"></div>
    </Layout>
  );
}
