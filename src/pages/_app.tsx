import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {Inter} from "next/font/google";
import {Notification, ConfirmationsModal} from "@/components";

const inter = Inter({subsets: ["latin"]});

export default function MyApp({Component, pageProps}: AppProps) {
  return (
    <main className={inter.className}>
      <Notification />
      <ConfirmationsModal />
      <Component {...pageProps} />
    </main>
  );
}
