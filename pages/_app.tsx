import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { SocketProvider } from "../src/context/socket-context";
import { GameProvider } from "../src/context/game-context";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <SocketProvider>
      <GameProvider>
        <Component {...pageProps} />
      </GameProvider>
    </SocketProvider>
  );
}
