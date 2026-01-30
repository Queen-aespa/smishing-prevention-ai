import { useEffect, useState } from "react";
import { auth, db, storage } from "./firebase";

export default function App() {
  const [status, setStatus] = useState("Initializing Firebase...");

  useEffect(() => {
    const ready = auth && db && storage;
    setStatus(ready ? "Firebase ready" : "Firebase not configured");
  }, []);

  return (
    <main className="app">
      <header className="app__header">
        <h1>Smishing Prevention</h1>
        <p>React + Firebase (Auth, Firestore, Storage)</p>
      </header>

      <section className="app__card">
        <p className="app__status">{status}</p>
        <p className="app__hint">
          Add your Firebase config values to <code>.env.local</code> in the
          frontend root.
        </p>
      </section>
    </main>
  );
}
