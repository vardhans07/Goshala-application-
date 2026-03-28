# Project Setup (Run once)

```bash
mkdir cow-tag-app && cd cow-tag-app
npx create-vite@latest frontend -- --template react
cd frontend && npm install && cd ..

mkdir backend && cd backend
npm init -y


👉 GitHub will render this with **colorful syntax highlighting** for shell commands.

---

## 📊 Alternatives
- **`.sh` file** → If you want it to be executable, save as `setup.sh`.  
  - Then you can run it directly in Linux:  
    ```bash
    bash setup.sh
    ```
  - GitHub will also highlight `.sh` files with shell syntax.  
- **`.txt` file** → Plain text only, no colors. Not recommended.  

---

## 🎨 Rule of Thumb
- **Documentation** → `.md` (Markdown) with fenced code blocks.  
- **Executable scripts** → `.sh`.  
- **Notes only** → `.txt`.  

---

👉 For your **“1. Project Setup (Run once)”** file, the best choice is **Markdown (`.md`)** if it’s documentation, or **Shell script (`.sh`)** if you want to actually run it.  

Would you like me to prepare a **ready‑to‑run `setup.sh` script** that automates your frontend + backend creation, so you don’t have to type each command manually?
