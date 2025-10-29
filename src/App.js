import React, { useState } from "react";
import "./App.css";
import JsonInput from "./components/JsonInput";
import JsonTree from "./components/JsonTree";

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [theme, setTheme] = useState("light"); 

  const handleJsonSubmit = (data) => {
    setJsonData(data);
  };

  const handleClear = () => {
    setJsonData(null);
  };

  return (
    <div className={`app-container ${theme}`}>
      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        aria-label="Toggle theme"
      >
        {theme === "light" ? ( 
          <i className="fa-solid fa-moon"></i>  ) : ( <i className="fa-solid fa-sun"></i>  
          )}

      </button>

      <header className="title">
        <h1>JSON Tree Visualizer</h1>
      </header>

      <main className="main-grid">
        <section className={`input-section ${theme}`}>
          <JsonInput onJsonSubmit={handleJsonSubmit} theme={theme} onClear={handleClear} />
        </section>

        <section className={`tree-section ${theme}`}>
          {jsonData ? (
            <JsonTree jsonData={jsonData} theme={theme} onReset={handleClear} />
          ) : (
            <div className="no-tree">Paste JSON and press <strong>Generate Tree</strong>.</div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
