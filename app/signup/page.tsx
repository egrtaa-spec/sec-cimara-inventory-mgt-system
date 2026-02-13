"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    site: "ENAM",
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/login");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Create Account</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <select
          value={form.site}
          onChange={e => setForm({ ...form, site: e.target.value })}
        >
          <option>ENAM</option>
          <option>MINFOPRA</option>
          <option>SUPPTIC</option>
          <option>ISMP</option>
        </select>

        <input
          type="text"
          placeholder="Username"
          required
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          style={{ display: "block", marginTop: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          style={{ display: "block", marginTop: 10 }}
        />

        <button
          type="submit"
          style={{ marginTop: 20 }}
        >
          Create Account
        </button>
      </form>
    </div>
  );
}