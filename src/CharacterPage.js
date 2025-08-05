import React, { useState } from "react";

export default function CharacterPage() {
  const [query, setQuery] = useState("");
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    level: "",
    organization: "",
    profession: "",
  });
  const [submissionMessage, setSubmissionMessage] = useState("");

  const handleSearch = async () => {
    setCharacter(null);
    setError(null);
    try {
      const res = await fetch(
        `https://nullspire-api.onrender.com/api/characters?name=${query}`
      );
      if (!res.ok) {
        throw new Error("Character not found");
      }
      const data = await res.json();
      setCharacter(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage("");
    try {
      const res = await fetch("https://nullspire-api.onrender.com/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }
      setSubmissionMessage(data.message);
      setForm({ name: "", level: "", organization: "", profession: "" });
    } catch (err) {
      setSubmissionMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <h1 className="text-4xl font-bold text-center mb-6 text-blue-400">
        NullSpire Character Lookup
      </h1>

      <div className="max-w-md mx-auto flex gap-2 mb-4">
        <input
          placeholder="Enter character name..."
          className="flex-grow bg-gray-800 border border-blue-600 text-white p-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

      {character && (
        <div className="bg-gray-800 border border-blue-700 max-w-md mx-auto mb-6 p-4 rounded">
          <h2 className="text-xl font-semibold text-blue-300 mb-2">
            {character.name}
          </h2>
          <p><strong>Level:</strong> {character.level}</p>
          <p><strong>Organization:</strong> {character.organization}</p>
          {character.profession && <p><strong>Profession:</strong> {character.profession}</p>}
        </div>
      )}

      <div className="max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">
          Submit a New Character
        </h2>
        <p className="text-sm text-gray-400 mb-2">
          This is a fan site. Submissions require admin approval.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            name="name"
            placeholder="Name"
            className="w-full bg-gray-800 border border-gray-700 text-white p-2"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="level"
            placeholder="Level"
            className="w-full bg-gray-800 border border-gray-700 text-white p-2"
            value={form.level}
            onChange={handleChange}
          />
          <input
            name="organization"
            placeholder="Organization"
            className="w-full bg-gray-800 border border-gray-700 text-white p-2"
            value={form.organization}
            onChange={handleChange}
          />
          <input
            name="profession"
            placeholder="Profession"
            className="w-full bg-gray-800 border border-gray-700 text-white p-2"
            value={form.profession}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 py-2 rounded"
          >
            Submit
          </button>
        </form>
        {submissionMessage && (
          <p className="text-center text-sm mt-2 text-yellow-400">
            {submissionMessage}
          </p>
        )}
      </div>

      <p className="text-xs text-center text-gray-500 mt-12">
        This fan site is not affiliated with NullSpire. All trademarks belong to their respective owners.
      </p>
    </div>
  );
}
