import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "ChatGPT123";
const API_BASE = "https://nullspire-api.onrender.com/api";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [error, setError] = useState(null);

  const login = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setError(null);
      fetchPending();
      fetchApproved();
    } else {
      setError("Incorrect password");
    }
  };

  const fetchPending = () => {
    fetch(`${API_BASE}/pending`, {
      headers: { "x-admin-password": ADMIN_PASSWORD },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or error fetching pending");
        return res.json();
      })
      .then(setPending)
      .catch((e) => setError(e.message));
  };

  const fetchApproved = () => {
    fetch(`${API_BASE}/approved`, {
      headers: { "x-admin-password": ADMIN_PASSWORD },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or error fetching approved");
        return res.json();
      })
      .then(setApproved)
      .catch((e) => setError(e.message));
  };

  const approve = (id) => {
    fetch(`${API_BASE}/pending/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": ADMIN_PASSWORD,
      },
      body: JSON.stringify({ id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to approve");
        return res.json();
      })
      .then(() => {
        fetchPending();
        fetchApproved();
      })
      .catch((e) => setError(e.message));
  };

  const reject = (id) => {
    fetch(`${API_BASE}/pending/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": ADMIN_PASSWORD,
      },
      body: JSON.stringify({ id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to reject");
        return res.json();
      })
      .then(() => fetchPending())
      .catch((e) => setError(e.message));
  };

  const deleteApproved = (id) => {
    if (!window.confirm("Are you sure you want to delete this character?")) return;
    fetch(`${API_BASE}/approved/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": ADMIN_PASSWORD },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        return res.json();
      })
      .then(() => fetchApproved())
      .catch((e) => setError(e.message));
  };

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    level: "",
    organization: "",
    profession: "",
  });

  const startEdit = (character) => {
    setEditId(character.id);
    setEditData({
      name: character.name,
      level: character.level,
      organization: character.organization,
      profession: character.profession,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({ name: "", level: "", organization: "", profession: "" });
    setError(null);
  };

  const saveEdit = async () => {
    const { name, level, organization, profession } = editData;
    const updates = [
      { field: "name", value: name },
      { field: "level", value: Number(level) },
      { field: "organization", value: organization },
      { field: "profession", value: profession },
    ];

    try {
      for (const { field, value } of updates) {
        const res = await fetch(`${API_BASE}/approved/edit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": ADMIN_PASSWORD,
          },
          body: JSON.stringify({ id: editId, field, value }),
        });
        if (!res.ok) throw new Error(`Failed to update ${field}`);
      }
      setEditId(null);
      setError(null);
      fetchApproved();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-4 bg-gray-900 text-white rounded shadow">
        <h1 className="text-2xl mb-4 text-blue-400">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          className="w-full p-2 mb-4 bg-gray-800 text-white border border-gray-700 rounded"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />
        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded"
        >
          Login
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 bg-gray-900 text-white rounded shadow">
      <h1 className="text-3xl mb-6 text-blue-400">Admin Panel</h1>
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => {
            setSelectedTab("pending");
            setError(null);
          }}
          className={`px-4 py-2 rounded ${
            selectedTab === "pending" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Pending Approvals ({pending.length})
        </button>
        <button
          onClick={() => {
            setSelectedTab("approved");
            setError(null);
          }}
          className={`px-4 py-2 rounded ${
            selectedTab === "approved" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Approved Characters ({approved.length})
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {selectedTab === "pending" && (
        <>
          {pending.length === 0 ? (
            <p>No pending characters.</p>
          ) : (
            <table className="w-full text-left border-collapse border border-gray-700">
              <thead>
                <tr>
                  <th className="border border-gray-700 p-2">Name</th>
                  <th className="border border-gray-700 p-2">Level</th>
                  <th className="border border-gray-700 p-2">Organization</th>
                  <th className="border border-gray-700 p-2">Profession</th>
                  <th className="border border-gray-700 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((c) => (
                  <tr key={c.id} className="border border-gray-700">
                    <td className="border border-gray-700 p-2">{c.name}</td>
                    <td className="border border-gray-700 p-2">{c.level}</td>
                    <td className="border border-gray-700 p-2">{c.organization}</td>
                    <td className="border border-gray-700 p-2">{c.profession}</td>
                    <td className="border border-gray-700 p-2 space-x-2">
                      <button
                        onClick={() => approve(c.id)}
                        className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(c.id)}
                        className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {selectedTab === "approved" && (
        <>
          {approved.length === 0 ? (
            <p>No approved characters.</p>
          ) : (
            <table className="w-full text-left border-collapse border border-gray-700">
              <thead>
                <tr>
                  <th className="border border-gray-700 p-2">Name</th>
                  <th className="border border-gray-700 p-2">Level</th>
                  <th className="border border-gray-700 p-2">Organization</th>
                  <th className="border border-gray-700 p-2">Profession</th>
                  <th className="border border-gray-700 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((c) =>
                  editId === c.id ? (
                    <tr key={c.id} className="border border-gray-700">
                      <td className="border border-gray-700 p-2">
                        <input
                          className="w-full bg-gray-800 border border-gray-600 text-white p-1 rounded"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                        />
                      </td>
                      <td className="border border-gray-700 p-2">
                        <input
                          type="number"
                          className="w-full bg-gray-800 border border-gray-600 text-white p-1 rounded"
                          value={editData.level}
                          onChange={(e) =>
                            setEditData({ ...editData, level: e.target.value })
                          }
                        />
                      </td>
                      <td className="border border-gray-700 p-2">
                        <input
                          className="w-full bg-gray-800 border border-gray-600 text-white p-1 rounded"
                          value={editData.organization}
                          onChange={(e) =>
                            setEditData({ ...editData, organization: e.target.value })
                          }
                        />
                      </td>
                      <td className="border border-gray-700 p-2">
                        <input
                          className="w-full bg-gray-800 border border-gray-600 text-white p-1 rounded"
                          value={editData.profession}
                          onChange={(e) =>
                            setEditData({ ...editData, profession: e.target.value })
                          }
                        />
                      </td>
                      <td className="border border-gray-700 p-2 space-x-2">
                        <button
                          onClick={saveEdit}
                          className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={c.id} className="border border-gray-700">
                      <td className="border border-gray-700 p-2">{c.name}</td>
                      <td className="border border-gray-700 p-2">{c.level}</td>
                      <td className="border border-gray-700 p-2">{c.organization}</td>
                      <td className="border border-gray-700 p-2">{c.profession}</td>
                      <td className="border border-gray-700 p-2 space-x-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="bg-yellow-600 hover:bg-yellow-500 px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteApproved(c.id)}
                          className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
