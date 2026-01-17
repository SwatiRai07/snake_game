import { useState, useEffect } from "react";
import Game from "./Game";
import Login from "./Login";
import OTP from "./OTP";
import Profile from "./Profile";

function App() {
  const [step, setStep] = useState("login");
  const [userValue, setUserValue] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("userEmail");
    const username = localStorage.getItem("username");

    if (loggedIn && email) {
      setUserValue(email);
      setStep(username ? "game" : "profile");
    }
  }, []);

  if (step === "login") {
    return (
      <Login
        onNext={(value) => {
          setUserValue(value);
          setStep("otp");
        }}
      />
    );
  }

  if (step === "otp") {
    return (
      <OTP
        userValue={userValue}
        onVerify={(hasProfile) => {
          if (hasProfile) {
            setStep("game");
          } else {
            setEditMode(false);
            setStep("profile");
          }
        }}
        onBack={() => setStep("login")}
      />
    );
  }

  if (step === "profile") {
    return (
      <Profile
        editMode={editMode}
        onBack={() => setStep("game")}
        onComplete={() => {
          setEditMode(false);
          setStep("game");
        }}
      />
    );
  }

  return (
    <Game
      onEditProfile={() => {
        setEditMode(true);
        setStep("profile");
      }}
    />
  );
}

export default App;
