import { Jost } from "next/font/google";
import "./globals.css";

const jostSans = Jost({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Book Reading App",
  description:
    "Book Reading Application is where stories meet technology to engage with more subscribers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${jostSans.variable}`}>{children}</body>
    </html>
  );
}
