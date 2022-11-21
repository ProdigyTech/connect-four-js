import Layout from "../../components/Layouts";
import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import Modal from "../../components/Winner";
import { GridState, GridState as GridStateObject } from "../util/types/types";

import {
  lastRows,
  indexColumnMap,
  PLAYER_1,
  PLAYER_2,
  checkWinConditions,
} from "../../util";

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

        // if we get to the end and the new position is at the bottom of the grid, set that position. 
        if (lastRows.includes(newPos)) {
          pos = newPos;
          notFound = false;
          break;
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

  // TODO: clean this up. 
  const onClickCell = useCallback(
    async (_: React.MouseEvent<HTMLElement>, i: number) => {
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
