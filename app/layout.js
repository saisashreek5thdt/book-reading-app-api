import "./globals.css";

export const metadata = {
  title: "Book Reading App",
  description: "Book Reading Application, where stories meet technology to add new book content on the go. So users can read on the fly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-Jost">
        {children}
      </body>
    </html>
  );
}
