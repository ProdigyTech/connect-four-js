import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import io from "Socket.IO-client";
import { PLAYER_1, PLAYER_2 } from "../../util";

const SocketContext = createContext();

export function AppWrapper({ children }) {
  const endPoint = "/api/socket";
  const [socketInstance, setSocketInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerList, setPlayerList] = useState([]);
  const [isWaitingForOtherPlayer, setIsWaitingForOtherPlayer] = useState(true);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [connectedUsers, setConnectedUser] = useState([]);
  const [player, setPlayer] = useState(null);
  const [gridState, setGridState] = useState([]);
  const [winner, setWinner] = useState({ player: null, won: false });
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [turnInProgress, setTurnInProgress] = useState(false)

  const socketInitializer = useCallback(async () => {
    await fetch(endPoint);
    setSocketInstance(io());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    socketInitializer();
  }, [socketInitializer]);

  const joinRoom = (id) => {
    socketInstance.emit("join", id);
    setJoinedRoom(true);
  };

  useEffect(() => {
    if (!isLoading && socketInstance) {
      socketInstance.on("connect", (data) => {
        console.log("connect");
        console.log("a user connected", data);
      });

      socketInstance.on("mouse-placement", (msg) => {
        console.log("mouse placement", msg);
      });

      socketInstance.on("disconnect", () => {
        console.log("disconnect");
      });

      socketInstance.on("animation", (data) => {
        setGridState(data);
      });

      socketInstance.on("win", (data) => {
        setWinner(data);
      });

      socketInstance.on("player-joined", (data) => {
        if (data.length > 1) {
          setIsWaitingForOtherPlayer(false);
            
          const player1or2 = data.indexOf(socketInstance.id);

          player1or2 == 0 ? setPlayer(PLAYER_1) : setPlayer(PLAYER_2);
          
        }
        setConnectedUser(data);
        console.log(data);
      });

      setSocketInstance(socketInstance);
    }
  }, [isLoading, socketInstance]);

  const values = {
    socketInstance: useMemo(() => socketInstance, [socketInstance]),
    isLoading,
    isWaitingForOtherPlayer,
    playerList,
    joinRoom,
    joinedRoom,
    connectedUsers,
    player,
    gridState,
    setGridState,
    winner, 
    setWinner
  };

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
}

export function useAppContext() {
  return useContext(SocketContext);
}
