
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const { token, user } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (token && user) {
    return <Dashboard />;
  }

  if (showSignup) {
    return <Signup onSwitch={() => setShowSignup(false)} />;
  }

  return <Login onSwitch={() => setShowSignup(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
