import React, { useState } from "react";
import "./JsonInput.css";

function JsonInput({ onJsonSubmit, onClear, theme = "light" }) {
  const [jsonText, setJsonText] = useState(""); 
  const [error, setError] = useState("");

  const handleGenerate = () => {
    if (!jsonText.trim()) {
      setError(
  <span style={{ color: "red" }}>
    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "6px"}}></i>
  Please enter JSON input.
  </span>
);
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      setError("");
      if (onJsonSubmit) onJsonSubmit(parsed);
    } catch (e) {
      setError(
  <span style={{ color: "red" }}>
    <i className="fa-solid fa-xmark" style={{ marginRight: "6px" }}></i>
    Invalid JSON format. Please correct and try again.
  </span>
);

    }
  };

  const handleClearInput = () => {
    setJsonText("");   
    setError("");      
    if (onClear) onClear();
  };

  return (
    <div className={`json-input-container ${theme}`}>
      <h2>Paste or type JSON data</h2>

      <textarea
        className="json-textarea"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder='Enter valid JSON here... e.g. {"user": {"name": "John"}}'
        aria-label="JSON input"
      />

      {error && <p className="error">{error}</p>}

      <div className="input-actions">
        <button className="generate-btn" onClick={handleGenerate}>
          Generate Tree
        </button>

        <button className={`clear-btn ${theme}`} onClick={handleClearInput}>
          Clear
        </button>
      </div>

    </div>
  );
}

export default JsonInput;
