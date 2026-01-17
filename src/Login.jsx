import { useState } from "react";
import "./Login.css";

export default function Login({ onNext }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendOtp = async () => {
    if (!email) {
      setMessage("❌ Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("❌ Enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("https://snake-game25.onrender.com/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        return;
      }

      // ✅ DIRECT OTP SCREEN (NO ALERT)
      onNext(email);

    } catch (err) {
      setMessage("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>🐍 Snake Game Login</h1>
      <p>Login With Your Email</p>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {message && <p className="msg">{message}</p>}

      <button onClick={handleSendOtp} disabled={loading}>
        {loading ? "Sending OTP..." : "Send OTP"}
      </button>
    </div>
  );
}
