import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import io from "Socket.IO-client";

const SocketContext = createContext();

export function AppWrapper({ children }) {
  const endPoint = "/api/socket";
  const [socketInstance, setSocketInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerList, setPlayerList] = useState([]);
  const [isWaitingForOtherPlayer, setIsWaitingForOtherPlayer] = useState(true)
  const [joinedRoom, setJoinedRoom] = useState(false)

  const socketInitializer = useCallback(async () => {
    await fetch(endPoint);
    setSocketInstance(io());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    socketInitializer();
  }, [socketInitializer]);

  const joinRoom = (id) => {
    socketInstance.emit("join", id)
    setJoinedRoom(true)
  }

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
  };

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
}

export function useAppContext() {
  return useContext(SocketContext);
}
