"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import ClientLayout from "./ClientLayout";
import Toast from "./Toast";
import ChangePasswordModal from "./ChangePasswordModal";

export default function AuthenticatedLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Exclude login page from auth check
    if (pathname === "/login") {
      setIsAuthenticated(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  // If login page, just render children without sidebar
  if (pathname === "/login") {
    return children;
  }

  return (
    <ClientLayout onPasswordModalOpen={() => setShowPasswordModal(true)}>
      {children}
      
      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)}
          onSuccess={(msg) => {
            setShowPasswordModal(false);
            setToast({ message: msg, type: "success" });
          }}
        />
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </ClientLayout>
  );
}
