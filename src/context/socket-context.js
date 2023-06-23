import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const endPoint = "/api/socket";
  const [socketInstance, setSocketInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedUsers, setConnectedUser] = useState([]);
  const [isError, setIsError] = useState(null);

  const handleErrors = (errors) => {
    setIsError(errors);
  };

  const socketInitializer = useCallback(async () => {
    await fetch(endPoint);
    setSocketInstance(io());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("connect_error", (err) => handleErrors(err));
      socketInstance.on("connect_failed", (err) => handleErrors(err));
      socketInstance.on("disconnect", (err) => handleErrors(err));
      socketInstance.on("err_connection_refused", (err) => handleErrors(err));
    }
  }, [socketInstance]);

  useEffect(() => {
    socketInitializer();
  }, [socketInitializer]);

  useEffect(() => {
    if (!isLoading && socketInstance) {
      socketInstance.on("connect", (data) => {
        console.log("connect");
        console.log("a user connected", data);
        setConnectedUser(data);
      });

      

      setSocketInstance(socketInstance);
    }
  }, [isLoading, socketInstance]);



  const values = {
    socketInstance: useMemo(() => socketInstance, [socketInstance]),
    isLoading,
    connectedUsers,
    isError,
  };

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}


