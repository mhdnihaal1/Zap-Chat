import Head from "next/head";
import { StateProvider } from "../context/StateContext.jsx";
import reducer, { initialState } from "@/context/StateReducers";
import "@/styles/globals.css";

 function App({ Component, pageProps }) {
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Head>
        <title>ZapChat</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <Component {...pageProps} />
    </StateProvider>
  );
}
export default App;