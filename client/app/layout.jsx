import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "StockFlow - Inventory Management",
  description: "Manage your inventory, products, and stock with ease",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
