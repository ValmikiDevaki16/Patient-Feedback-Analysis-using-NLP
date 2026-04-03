import { useState } from "react";
import Landing from "./pages/Landing";
import RoleSelection from "./pages/RoleSelection";
import PatientPortal from "./pages/PatientPortal";
import AdminDashboard from "./pages/AdminDashboard";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";

function App() {
  const [screen, setScreen] = useState("landing");
  const [staffData, setStaffData] = useState(null);

  const renderScreen = () => {
    switch (screen) {
      case "landing":
        return (
          <Landing
            onContinue={() => setScreen("role-selection")}
            onAdmin={() => setScreen("admin")}
            onPatient={() => setScreen("patient")}
            onStaff={() => setScreen("staff-login")}
          />
        );
      case "role-selection":
        return (
          <RoleSelection
            onSelectRole={(role) => {
              if (role === "staff") {
                setScreen("staff-login");
              } else {
                setScreen(role);
              }
            }}
          />
        );
      case "patient":
        return <PatientPortal onBack={() => setScreen("landing")} />;
      case "admin":
        return <AdminDashboard onBack={() => setScreen("landing")} />;
      case "staff-login":
        return (
          <StaffLogin
            onBack={() => setScreen("landing")}
            onLogin={(staff) => {
              setStaffData(staff);
              setScreen("staff-dashboard");
            }}
          />
        );
      case "staff-dashboard":
        return (
          <StaffDashboard
            staff={staffData}
            onBack={() => {
              setStaffData(null);
              setScreen("landing");
            }}
          />
        );
      default:
        return <RoleSelection onSelectRole={(role) => setScreen(role)} />;
    }
  };

  return <>{renderScreen()}</>;
}

export default App;
