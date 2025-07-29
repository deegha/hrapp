import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {Inter} from "next/font/google";
import {Notification, ConfirmationsModal} from "@/components";
import zipy from "zipyai";
const inter = Inter({subsets: ["latin"]});

if (process.env.NEXT_PUBLIC_ENVIRONMENT !== "development") {
  zipy.init("74aae3f7");
}

export default function MyApp({Component, pageProps}: AppProps) {
  return (
    <main className={inter.className}>
      <Notification />
      <ConfirmationsModal />
      <Component {...pageProps} />
    </main>
  );
}
