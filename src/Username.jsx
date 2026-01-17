import { useState } from "react";
import "./Username.css";

export default function Username({ userId, onDone }) {
  const [username, setUsername] = useState("");

  const saveUsername = async () => {
    if (!username) {
      alert("Enter username");
      return;
    }

    const res = await fetch("http://localhost:5000/api/auth/set-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, username }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    onDone(username);
  };

  return (
    <div className="username-container">
      <h2>👤 Create Username</h2>
      <input
        placeholder="Your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={saveUsername}>Continue</button>
    </div>
  );
}
