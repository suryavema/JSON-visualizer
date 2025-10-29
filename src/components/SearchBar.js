import React, { useState, useEffect } from "react";

const SearchBar = ({ onSearch, theme = "light" }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch((query || "").trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [query, onSearch]);

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", width: "100%" }}>
      <i class="fas fa-search"></i>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="JSONPath e.g. $.user or $.items[0].name"
        style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,0.08)",
          background: theme === "dark" ? "#07120f" : "#fff",
          color: theme === "dark" ? "#d1fae5" : "#0a0a0a",
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default SearchBar;
