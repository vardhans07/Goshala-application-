# 🍥 Project Setup (Run once)

Initialize the project structure with **frontend (React + Vite)** and **backend (Node.js)**.

```bash
mkdir cow-tag-app && cd cow-tag-app
```

```bash
npx create-vite@latest frontend -- --template react
```

```bash
cd frontend && npm install && cd ..
```

```bash
mkdir backend && cd backend
```
```bash
npm init -y
```

#🍥Install backend dependencies

```bash
npm install express @prisma/client prisma cors dotenv jsonwebtoken bcryptjs socket.io exceljs pdfkit qrcode
```
```bash
npm install -D nodemon
```

#🍥Install frontend dependencies

```bash
cd ../frontend
```
```bash
npm install axios react-router-dom chart.js react-chartjs-2 html5-qrcode socket.io-client qrcode react-icons
```
