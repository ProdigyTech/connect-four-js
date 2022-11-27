import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { AppWrapper } from "../src/context/socket-context";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppWrapper>
      <Component {...pageProps} />
    </AppWrapper>
  );
}
