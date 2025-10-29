# 🌳 JSON Tree Visualizer

An interactive web application to visualize JSON data as a hierarchical graph using **React Flow**.  
Paste JSON, generate the tree, search using JSONPath, toggle themes, copy node paths, and download the tree as an image — all in one place!

---

## 🚀 Features

✅ JSON Input with validation  
✅ Interactive tree visualization using React Flow  
✅ Object, Array, and Primitive nodes styled differently  
✅ Search using JSONPath (example: `$.user.address.city` or `$.items[0].name`)  
✅ Highlight searched node & auto-pan view  
✅ Dark / Light mode toggle 🌗  
✅ Copy JSON path by clicking a node 📋  
✅ Download tree as PNG 🖼  
✅ Fully responsive layout 📱  
✅ Clear button to reset input and visualization  

---

## 📸 Screenshots

| Light Mode | Dark Mode |
|-----------|-----------|
| _(Add Screenshot Here)_ | _(Add Screenshot Here)_ |

> You can update these once deployed

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React.js | UI Framework |
| React Flow | Tree Visualization |
| CSS | Styling & Themes |
| JSONPath Logic | Search queries |

---

## 📌 How to Use

1️⃣ Paste or type valid JSON in the input box  
2️⃣ Click **Generate Tree**  
3️⃣ Use Search Bar to highlight a node  
4️⃣ Toggle **Dark / Light Mode** at any time  
5️⃣ Click a node to copy its JSON path  
6️⃣ Download tree as PNG if needed  
7️⃣ Clear button to reset everything

---

## 🧪 JSONPath Search Examples

| Query | Result |
|-------|--------|
| `$.user` | Highlights entire `user` object |
| `$.user.address.city` | Highlights `"New York"` |
| `$.items[1].name` | Highlights `"item2"` |

---

## ⚙️ Setup & Run Locally

```bash
# Clone the repository
git clone https://github.com/suryavema/JSON-visualizer.git

cd json-tree-visualizer

# Install dependencies
npm install

# Start development server
npm start
