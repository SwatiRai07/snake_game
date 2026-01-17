import { useState } from "react";
import "./OTP.css";

export default function OTP({ onVerify, userValue, onBack }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  // 🔹 VERIFY OTP ONLY
  const verifyOtp = async () => {
    if (otp.length !== 4) {
      setMessage("Enter valid 4 digit OTP");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: userValue,
          otp: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Invalid OTP");
        return;
      }

      // ✅ LOGIN STATE SAVE
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", userValue);

      // 🔥 ADD ONLY THIS (FOR OLD USER)
      if (data.hasProfile) {
        const profileRes = await fetch(
          `http://localhost:5000/api/auth/profile/${userValue}`
        );

        const profileData = await profileRes.json();

        if (profileRes.ok) {
          if (profileData.username) {
            localStorage.setItem("username", profileData.username);
          }
          if (profileData.avatar) {
            localStorage.setItem("avatar", profileData.avatar);
          }
        }
      }

      // 👉 go to game / profile logic
      onVerify(data.hasProfile);

    } catch (err) {
      setMessage("❌ OTP verification failed");
    }
  };

  // 🔁 RESEND OTP
  const resendOtp = async () => {
    setResending(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: userValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Resend failed");
      } else {
        setMessage("✅ New OTP sent to your email");
      }
    } catch (err) {
      setMessage("❌ Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-container">
      {/* 🔙 BACK BUTTON */}
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
      )}

      <h1>🔐 OTP Verification</h1>
      <p>OTP sent to</p>
      <b>{userValue}</b>

      <input
        type="text"
        placeholder="Enter 4 digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={4}
      />

      {message && <p className="otp-error">{message}</p>}

      <button onClick={verifyOtp}>Verify OTP</button>

      {/* 🔁 RESEND OTP */}
      <button
        className="resend-btn"
        onClick={resendOtp}
        disabled={resending}
      >
        {resending ? "Resending..." : "Resend OTP"}
      </button>
    </div>
  );
}
