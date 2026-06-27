import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./_components/Sidebar";
import { ManageProvider } from "./_components/ManageProvider";
import CityBreadcrumb from "./_components/CityBreadcrumb";

export const metadata: Metadata = {
  title: "BumiSupport+",
  description: "Directory of businesses in Johor Bahru",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex">
        <ManageProvider>
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-auto">
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold text-gray-800">Business Directory</span>
            <CityBreadcrumb />
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
        </ManageProvider>
      </body>
    </html>
  );
}
