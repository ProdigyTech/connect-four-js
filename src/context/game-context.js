import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useContext,
} from "react";
import { PLAYER_1, PLAYER_2 } from "../../util";
import { useSocketContext } from "./socket-context";

const GameContext = createContext();

export function GameProvider({ children }) {
  const { socketInstance, isLoading } = useSocketContext();

  const [playerList, setPlayerList] = useState([]);
  const [isWaitingForOtherPlayer, setIsWaitingForOtherPlayer] = useState(true);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [player, setPlayer] = useState(null);
  const [gridState, setGridState] = useState([]);
  const [winner, setWinner] = useState({ player: null, won: false });
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameError, setGameError] = useState(null);

  const joinRoom = useCallback(
    (id) => {
      if (!isLoading) {
        socketInstance.emit("join", id);
        setJoinedRoom(true);
      }
    },
    [socketInstance, isLoading]
  );

  const broadcastGameError = useCallback(
    (e) => {
      if (!isLoading) {
        socketInstance.emit("game-error", e);
      }
    },
    [isLoading, socketInstance]
  );

  const mouseTracker = useCallback(
    () => (e) => {
      if (socketInstance && !isLoading) {
        const { clientX, clientY } = e;
        socketInstance.emit("mouse-move", { clientX, clientY });
      }
    },
    [socketInstance, isLoading]
  );

  const changePlayer = useCallback(() => {
    if (!isLoading) {
      const nextPlayer = currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
      socketInstance.emit("change-player", nextPlayer);
      setCurrentPlayer(nextPlayer);
    }
  }, [isLoading, socketInstance, currentPlayer]);

  useEffect(() => {
    if (!isLoading && socketInstance) {
      socketInstance.on("reset-game", () => {
        console.log("game reset");
        setGridState([]);
        setWinner({ player: null, won: false });
        setCurrentPlayer(null);
        setGameError(null);
      });

      socketInstance.on("game-error", () => {
        setGameError(true);
      });

      socketInstance.on("client-disconnect", () => {
        setIsWaitingForOtherPlayer(true);
      });

      socketInstance.on("animation", (data) => {
        setGridState(data);
      });

      socketInstance.on("change-player", (data) => {
        setCurrentPlayer(data);
      });

      socketInstance.on("win", (data) => {
        setWinner(data);
      });

      socketInstance.on("player-joined", (data) => {
        console.log(data);
        if (data.length > 1) {
          setIsWaitingForOtherPlayer(false);
          socketInstance.emit("player-joined");
          socketInstance.emit("change-player", PLAYER_1);
          const playerIndex = data.indexOf(socketInstance.id);
          setPlayer(playerIndex === 0 ? PLAYER_1 : PLAYER_2);
        }
        setPlayerList(data);
      });
    }
  }, [isLoading, socketInstance]);

  const values = {
    playerList,
    isWaitingForOtherPlayer,
    joinedRoom,
    player,
    gridState,
    setGridState,
    winner,
    currentPlayer,
    changePlayer,
    joinRoom,
    setWinner,
    gameError,
    mouseTracker,
    broadcastGameError,
  };

  return <GameContext.Provider value={values}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  return useContext(GameContext);
}
