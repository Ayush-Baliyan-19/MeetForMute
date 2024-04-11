import "@/styles/globals.css";
import { SocketProvider } from "@/context/socket";
import "../styles/index.css";

export default function App({ Component, pageProps }) {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  );
}
