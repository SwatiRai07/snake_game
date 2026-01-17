import { useState } from "react";
import "./Profile.css";

export default function Profile({ onComplete, editMode = false, onBack }) {
  const [username, setUsername] = useState(
    editMode ? localStorage.getItem("username") || "" : ""
  );
  const [dob, setDob] = useState(
    editMode ? localStorage.getItem("dob") || "" : ""
  );
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(
    editMode ? localStorage.getItem("avatar") : null
  );
  const [message, setMessage] = useState("");

  // IMAGE HANDLE (same, safe)
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => (img.src = reader.result);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 300;
      let w = img.width;
      let h = img.height;

      if (w > h && w > MAX) {
        h = (h * MAX) / w;
        w = MAX;
      } else if (h > MAX) {
        w = (w * MAX) / h;
        h = MAX;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const base64 = canvas.toDataURL("image/jpeg", 0.7);
      setAvatar(base64);
      setPreview(base64);
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // ✅ SAFE UPDATE (ADD)
  // =========================
  const handleSubmit = async () => {
    setMessage("");

    const oldUsername = localStorage.getItem("username");
    const oldDob = localStorage.getItem("dob");

    const finalUsername = username || oldUsername;
    const finalDob = dob || oldDob;

    if (!finalUsername || !finalDob) {
      setMessage("At least username and DOB must exist");
      return;
    }

    // ✅ AGE VALIDATION (10–100 only)
    const birthDate = new Date(finalDob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 10 || age > 100) {
      setMessage("Age must 6 year's old");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: localStorage.getItem("userEmail"),
          username: finalUsername,
          dob: finalDob,
          avatar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Profile save failed");
        return;
      }

      // ✅ LOCAL STORAGE UPDATE (instant UI)
      localStorage.setItem("username", finalUsername);
      localStorage.setItem("dob", finalDob);
      if (avatar) localStorage.setItem("avatar", avatar);

      setMessage(
        editMode
          ? "Profile updated successfully ✅"
          : "Profile created successfully ✅"
      );

      setTimeout(() => {
        onComplete();
      }, 1200);
    } catch (err) {
      setMessage("Profile save error");
    }
  };

  return (
    <div className="profile-container">
      <h1>👤 {editMode ? "Edit Profile" : "Create Profile"}</h1>

      {/*  BACK BUTTON (ADD) */}
      {editMode && (
        <button className="back-btn" onClick={onBack}>
          🔙
        </button>
      )}

      <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
      />

      {/* avatar via icon click */}
      <label className="avatar-label">
        {preview ? (
          <img src={preview} alt="User Avatar" className="avatar-preview" />
        ) : (
          <div className="avatar-placeholder">👤</div>
        )}
        <input type="file" hidden accept="image/*" onChange={handleAvatar} />
      </label>

      {message && <p className="msg">{message}</p>}

      <button onClick={handleSubmit}>
        {editMode ? "Save Changes" : "Save Profile"}
      </button>
    </div>
  );
}
