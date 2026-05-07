import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "MoodAnime",
  description: "Find anime based on your mood",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}