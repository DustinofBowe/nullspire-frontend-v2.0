import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import AdminPage from "./AdminPage";

const backendURL = "https://nullspire-api.onrender.com";

function LookupPage() {
  const [lookupName, setLookupName] = useState("");
  const [lookupResults, setLookupResults] = useState(null);

  const handleLookup = () => {
    setLookupResults(null);
    if (!lookupName) return;
    fetch(`${backendURL}/api/characters?name=${encodeURIComponent(lookupName)}`)
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error("Character Not Found");
      })
      .then((data) => setLookupResults(data))
      .catch(() => setLookupResults({ error: "Character Not Found." }));
  };

  return (
    <div>
      <h1>NullSpire Character Lookup</h1>
      <nav>
        <Link to="/">Lookup</Link> | <Link to="/submit">Submit</Link>
      </nav>

      <input
        type="text"
        placeholder="Enter character name"
        value={lookupName}
        onChange={(e) => setLookupName(e.target.value)}
      />
      <button onClick={handleLookup}>Search</button>

      {lookupResults && (
        <div>
          {lookupResults.error ? (
            <p>{lookupResults.error}</p>
          ) : Array.isArray(lookupResults) ? (
            lookupResults.length === 0 ? (
              <p>No characters found.</p>
            ) : (
              <ul>
                {lookupResults.map((char) => (
                  <li key={char.id}>
                    <p><strong>Name:</strong> {char.name}</p>
                    <p><strong>Level:</strong> {char.level}</p>
                    <p><strong>Organization:</strong> {char.organization}</p>
                    <p><strong>Profession:</strong> {char.profession}</p>
                    <hr />
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div>
              <p>Name: {lookupResults.name}</p>
              <p>Level: {lookupResults.level}</p>
              <p>Organization: {lookupResults.organization}</p>
              <p>Profession: {lookupResults.profession}</p>
            </div>
          )}
        </div>
      )}

      <footer style={{ marginTop: "30px", fontSize: "12px", color: "gray" }}>
        This is a fan site and is not officially affiliated with NullSpire.
      </footer>
    </div>
  );
}

function SubmitPage() {
  const [submitData, setSubmitData] = useState({
    name: "",
    level: "",
    organization: "",
    profession: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = () => {
    const { name, level, organization, profession } = submitData;
    if (!name || !level || !organization || !profession) {
      setSubmitMessage("Missing fields");
      return;
    }

    setSubmitMessage("");
    fetch(`${backendURL}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setSubmitMessage("Submission failed: " + data.error);
        else setSubmitMessage("Submission successful, pending approval.");
        setSubmitData({ name: "", level: "", organization: "", profession: "" });
      })
      .catch(() => setSubmitMessage("Submission failed"));
  };

  return (
    <div>
      <h1>Submit a Character</h1>
      <nav>
        <Link to="/">Lookup</Link> | <Link to="/submit">Submit</Link>
      </nav>

      <input
        type="text"
        placeholder="Name"
        value={submitData.name}
        onChange={(e) => setSubmitData({ ...submitData, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Level"
        value={submitData.level}
        onChange={(e) => setSubmitData({ ...submitData, level: e.target.value })}
      />
      <input
        type="text"
        placeholder="Organization"
        value={submitData.organization}
        onChange={(e) =>
          setSubmitData({ ...submitData, organization: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Profession"
        value={submitData.profession}
        onChange={(e) =>
          setSubmitData({ ...submitData, profession: e.target.value })
        }
      />
      <button onClick={handleSubmit}>Submit</button>
      {submitMessage && <p>{submitMessage}</p>}

      <footer style={{ marginTop: "30px", fontSize: "12px", color: "gray" }}>
        This is a fan site and is not officially affiliated with NullSpire.
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LookupPage />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
