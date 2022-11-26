import Layout from "../../src/components/Layouts";
import { useCallback, useState, useEffect } from "react";
import { flushSync } from "react-dom";
import Modal, { NoticeModal } from "../../src/components/Winner";
import { GridState, GridState as GridStateObject } from "../util/types/types";
import { useAppContext } from "../../src/context/socket-context";

import {
  lastRows,
  indexColumnMap,
  PLAYER_1,
  PLAYER_2,
  checkWinConditions,
} from "../../util";

export default function Home({ id }) {
  const [mousePlacement, setMousePlacement] = useState(null);
  const [animationInProgress, setAnimationInProgress] = useState(false);

  const {
    socketInstance,
    isLoading,
    joinedRoom,
    joinRoom,
    connectedUsers,
    isWaitingForOtherPlayer,
    player,
    gridState,
    setGridState,
    winner,
    setWinner,
    changePlayer,
    currentPlayer,
    isError
  } = useAppContext();

  console.log(isError, 'is error')

  useEffect(() => {
    if (!joinedRoom && !isLoading) {
      joinRoom(id);
    }
  }, [joinRoom, joinedRoom, id, isLoading]);



  const mouseTracker = ({ clientY, clientX }) => {
    if (!isLoading && socketInstance) {
      // console.log("mouse-move", { clientX, clientY });
      //   socketInstance.emit("mouse-move", { clientX, clientY });
    }
  };

  useEffect(() => {
    // socketInstance?.on("mouse-placement", ({ clientX, clientY }) => {
    //   setMousePlacement({ clientX, clientY });
    // });

    socketInstance?.on("animation-send", (data) => {
      setGridState(data);
    });

    // window.socketCall = function (on, message) {
    //   socketInstance.emit(on, message);
    // };
  }, [socketInstance]);

  useEffect(() => {
    if (window) {
      window.addEventListener("mousemove", mouseTracker);
    }
  }, []);

  const resetGame = useCallback(() => {
    setGridState([]);
    setAnimationInProgress(false);
    setWinner({ player: null, won: false });
    socketInstance.emit("animation", []);
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
              setGridState((g) => {
                socketInstance.emit("animation", [
                  ...g,
                  { cell: element, user: player },
                ]);
                return [...g, { cell: element, user: player }];
              });

              resolve();
            });
          } else {
            flushSync(() => {
              // remove the previous element from the animation, add new element to the array.
              // this simulates "dropping" the chip in the gameboard.
              setGridState((g) => {
                const lastElement = g[g.length - 1];
                const filtered = g.filter((e) => e.cell !== lastElement.cell);
                socketInstance.emit("animation", [
                  ...filtered,
                  { cell: element, user: player },
                ]);
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
      socketInstance.emit("animation", newGridState);

      const gameStatus = checkWinConditions(newGridState, player);

      if (gameStatus.won) {
        setWinner(gameStatus);
        socketInstance.emit("win", gameStatus);
      } else {
        changePlayer()
        // change player
        // unlock gameboard
      }
    },
    [gridState, player, findCellPlacement, animationPromise]
  );

  console.log(currentPlayer, player)

  const myStyle = {
    left: `${mousePlacement?.clientX || 0}px`,
    top: `${mousePlacement?.clientY || 0}px`,
    "background-color": "black",
    width: "25px",
    height: "25px",
    background: "black",
    position: "absolute",
  };

  return (
    <>
      <h3>
        {" "}
        Current Player:{" "}
        <b>
          {player ? (player === PLAYER_1 ? "Player 1" : "Player 2") : ""}
          <br />
          <br />
          {currentPlayer &&
            `${
              currentPlayer === PLAYER_1 ? "Player 1" : "Player 2"
            } is currently taking their turn`}
        </b>{" "}
      </h3>
      <Layout>
        <div style={myStyle}></div>
        {isError && (
          <NoticeModal
            message={`There was an error connecting to the game server. \n Try again later`}
            header={`Something went wrong`}
          />
        )}
        {isLoading &&
          !isError && (
            <NoticeModal
              message={`connecting to game server`}
              header={`Please wait...`}
            />
          )}
        {!isLoading && isWaitingForOtherPlayer && !isError && (
          <NoticeModal
            message={`Waiting for opponent to join`}
            header={`Please wait...`}
          />
        )}
        {winner.won && <Modal player={winner.player} onClick={resetGame} />}

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
                  animationInProgress || currentPlayer !== player
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

Home.getInitialProps = async ({ query }) => {
  const { id } = query;

  return { id };
};
