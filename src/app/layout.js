import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "./components/LenisProvider";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Flowbee Campaign Scheduler",
  description: "Manage your Flowbee marketing campaigns",
  icons: {
    icon: "https://flowbee.io/images/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LenisProvider>
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </LenisProvider>
      </body>
    </html>
  );
}
