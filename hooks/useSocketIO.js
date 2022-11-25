import io from "Socket.IO-client";
import { useState, useEffect, useCallback, memo, useMemo } from "react";

// socketMethods array of objects, {on: String, callback: Function}

export const useSocketIO = ({ socketCallbacks, endPoint }) => {
  const [socketInstance, setSocketInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const socketInitializer = useCallback(async () => {
    await fetch(endPoint);
    setSocketInstance(io());
    setIsLoading(false);
  }, [endPoint]);

  useEffect(() => {
    socketInitializer();
  }, [socketInitializer]);

  useEffect(() => {
    if (!isLoading && socketInstance) {
      socketCallbacks.forEach((s) => {
        socketInstance.on(s.on, s.callBack);
      });
    }
  }, [isLoading, socketInstance, socketCallbacks]);

  console.log("socketInstance", socketInstance);

  return {
    socketInstance: useMemo(() => socketInstance, [socketInstance]),
    isLoading,
  };
};
