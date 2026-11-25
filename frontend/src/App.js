import { useEffect, useState } from "react";
import "./App.css";

async function readJson(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "The request could not be completed.");
  }
  return data;
}

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const response = await fetch("/api/items");
        setItems(await readJson(response));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  async function addItem(event) {
    event.preventDefault();
    const itemName = name.trim();
    if (!itemName || saving) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: itemName }),
      });
      const item = await readJson(response);
      setItems((currentItems) => [item, ...currentItems]);
      setName("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <section className="panel" aria-labelledby="page-title">
        <p className="eyebrow">DEVOPS PRACTICE PROJECT</p>
        <h1 id="page-title">Task list</h1>
        <p className="intro">Add an item and see it saved in PostgreSQL.</p>

        <form className="add-form" onSubmit={addItem}>
          <label className="visually-hidden" htmlFor="item-name">
            New item
          </label>
          <input
            id="item-name"
            type="text"
            maxLength="200"
            placeholder="What needs to be done?"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <button type="submit" disabled={saving || !name.trim()}>
            {saving ? "Adding..." : "Add item"}
          </button>
        </form>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="list-heading">
          <h2>Your items</h2>
          <span>{items.length}</span>
        </div>

        {loading ? (
          <p className="empty-state">Loading items...</p>
        ) : items.length ? (
          <ul className="item-list">
            {items.map((item) => (
              <li key={item.id}>
                <span className="item-dot" aria-hidden="true" />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No items yet. Add your first one above.</p>
        )}
      </section>
      <footer>React · Express · PostgreSQL</footer>
    </main>
  );
}

export default App;
