import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../context/useAuth";
import { useState } from "react";

function MainLayoutContent() {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        user={user}
        onLogout={logout}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

function MainLayout() {
  return (
    <AuthProvider>
      <MainLayoutContent />
    </AuthProvider>
  );
}

export default MainLayout;