import Layout from "../../src/components/Layouts";
import { useCallback, useState, useEffect } from "react";
import { flushSync } from "react-dom";
import Modal, { NoticeModal } from "../../src/components/Winner";
import {
  GridState,
  GridState as GridStateObject,
} from "../../util/types/types";
import { useSocketContext } from "../../src/context/socket-context";
import { useGameContext } from "../../src/context/game-context";

import {
  lastRows,
  indexColumnMap,
  PLAYER_1,
  checkWinConditions,
} from "../../util";
import { useRouter } from "next/router";
import React from "react";

//TODO: Find a better way to handle player 1 and player 2, i.e use state from socket server-side to assign players, store that in state.
// need to only be able to access this page from /index, maybe add some sort of check

// eslint-disable-next-line
export default function Home({ id }: { id: string }) {
  const router = useRouter();

  const [mousePlacement, setMousePlacement] = useState({
    clientX: 0,
    clientY: 0,
  });
  const [animationInProgress, setAnimationInProgress] = useState(false);

  const {
    socketInstance,
    isLoading,
    isError: isSocketError,
  } = useSocketContext();

  const {
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
    gameError,
    mouseTracker,
    broadcastGameError,
  } = useGameContext();

  useEffect(() => {
    // @ts-ignore
    if (!window.connectFour) {
      joinRoom(id);
    }
  }, [id, joinRoom]);

  useEffect(() => {
    // @ts-ignore
    socketInstance?.on("mouse-placement", ({ clientX, clientY }) => {
      setMousePlacement({ clientX, clientY });
    });

    socketInstance?.on("animation-send", (data: Array<GridState>) => {
      setGridState(data);
    });

    socketInstance?.on("reset-game", () => {
      setGridState([]);
      setWinner({ player: null, won: false });
    });
  }, [setGridState, setWinner, socketInstance]);

  useEffect(() => {
    // @ts-ignore
    window.broadcastGameError = broadcastGameError;

    if (isSocketError || gameError) {
      broadcastGameError(true);
    }
  }, [isSocketError, gameError, broadcastGameError]);

  useEffect(() => {
    if (socketInstance && socketInstance?.emit?.()) {
      window.addEventListener("mousemove", (e) =>
        socketInstance?.emit("mouse-move", {
          clientX: e.clientX,
          clientY: e.clientY,
          room: router.query.id,
        })
      );
    }
  }, [socketInstance, router.query.id]);

  const resetGame = useCallback(() => {
    socketInstance.emit("reset-game", []);
  }, [socketInstance]);

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
              setGridState((g: Array<GridState>) => {
                socketInstance.emit("animation", [
                  ...g,
                  { cell: element, user: player },
                ]);
                return [...g, { cell: element, user: player }];
              });

              resolve("");
            });
          } else {
            flushSync(() => {
              // remove the previous element from the animation, add new element to the array.
              // this simulates "dropping" the chip in the gameboard.
              setGridState((g: Array<GridState>) => {
                const lastElement = g[g.length - 1];
                const filtered = g.filter(
                  (e: GridStateObject) => e.cell !== lastElement.cell
                );
                socketInstance.emit("animation", [
                  ...filtered,
                  { cell: element, user: player },
                ]);
                return [...filtered, { cell: element, user: player }];
              });
              resolve("");
            });
          }
        }, 60);
      });
    },
    [player, setGridState, socketInstance]
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
      // @ts-ignore
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
        changePlayer(socketInstance);
      }
    },
    [
      findCellPlacement,
      gridState,
      player,
      setGridState,
      socketInstance,
      animationPromise,
      setWinner,
      changePlayer,
    ]
  );

  const myStyle = {
    left: `${mousePlacement?.clientX + 10 || 0}px`,
    top: `${mousePlacement?.clientY + 10 || 0}px`,
    backgroundColor: "black",
    // width: "35px",
    // height: "35px",
    position: "absolute",
    color: "red",
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
          {currentPlayer`${
            currentPlayer === PLAYER_1 ? "Player 1" : "Player 2"
          } is currently taking their turn`}
        </b>{" "}
      </h3>
      <Layout>
        {/* @ts-ignore  */}
        {!isWaitingForOtherPlayer && (
          <div style={myStyle}>Opposite Player mouse position</div>
        )}
        {isSocketError && (
          <NoticeModal
            message={`There was an error connecting to the game server. \n Try again later`}
            header={`Something went wrong`}
            onClick={() => {
              router.push("/");
            }}
          />
        )}
        {gameError && (
          <NoticeModal
            message={`The game encountered an unexpected error, please refresh the page`}
            header={`That's not good....`}
            onClick={() => {
              router.push("/");
            }}
          />
        )}
        {isLoading && !isSocketError && !gameError && (
          <NoticeModal
            message={`connecting to game server`}
            header={`Please wait...`}
            onClick={() => {
              router.push("/");
            }}
          />
        )}
        {!isLoading &&
          isWaitingForOtherPlayer &&
          !isSocketError &&
          !gameError && (
            <NoticeModal
              message={`Waiting for opponent to join`}
              header={`Please wait...`}
              onClick={() => {
                router.push("/");
              }}
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
// @ts-ignore
Home.getInitialProps = async ({ query }: { query }) => {
  const { id }: { id: String } = query;

  return { id };
};
