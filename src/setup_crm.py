import os
import sys
import subprocess
import json

class Colors:
    OKGREEN = '\033[92m'
    OKBLUE = '\033[94m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'

def log(message, color=Colors.OKBLUE):
    print(f"{color}{message}{Colors.ENDC}")

def check_node():
    try:
        subprocess.check_output(['node', '--version'])
        log("✅ Node.js detectado", Colors.OKGREEN)
        return True
    except Exception:
        log("❌ Node.js não encontrado", Colors.FAIL)
        return False

def create_structure():
    folders = ["src/components", "src/pages", "src/layouts", "src/hooks", "src/services", "src/utils", "src/styles", "public"]
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        log(f"📁 {folder}")

files = {
    "package.json": """{
  "name": "crm-bom-samaritano",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}""",
    "vite.config.ts": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})""",
    "tsconfig.json": """{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}""",
    "tailwind.config.ts": """export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          bg: 'rgba(139, 92, 246, 0.15)',
        },
      },
    },
  },
  plugins: [],
}""",
    "postcss.config.js": """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}""",
    ".gitignore": """node_modules
dist
.env
.DS_Store""",
    "index.html": """<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CRM Bom Samaritano</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="dark">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"><\/script>
  </body>
</html>""",
    "src/styles/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #000000;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
}

.glass-card {
  background: rgba(25, 25, 25, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}""",
    "src/main.tsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)""",
    "src/App.tsx": """import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}""",
    "src/layouts/MainLayout.tsx": """import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}""",
    "src/components/Sidebar.tsx": """import { LayoutDashboard, Users, UserPlus, Heart, Wallet, MessageSquare, Settings } from 'lucide-react'

export default function Sidebar() {
  const items = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: UserPlus, label: 'Visitantes' },
    { icon: Users, label: 'Membros' },
    { icon: Heart, label: 'Discipulado' },
    { icon: Wallet, label: 'Financeiro' },
    { icon: MessageSquare, label: 'Mensagens' },
    { icon: Settings, label: 'Configurações' },
  ]

  return (
    <aside className="w-64 bg-zinc-950 border-r border-white/10 p-6">
      <h1 className="text-xl font-bold text-purple-400 mb-8">Bom Samaritano</h1>
      <nav className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 cursor-pointer transition-all">
            <item.icon size={20} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  )
}""",
    "src/components/Header.tsx": """export default function Header() {
  return (
    <header className="h-16 border-b border-white/10 px-8 flex items-center">
      <div className="flex-1">
        <input type="text" placeholder="Buscar..." className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-80 focus:outline-none focus:border-purple-500" />
      </div>
      <div className="text-sm text-gray-400">Pr. Anderson Silva</div>
    </header>
  )
}""",
    "src/pages/Dashboard.tsx": """import { Users, UserCheck, TrendingUp, Heart } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { label: 'Membros', value: '1.248', icon: Users },
    { label: 'Visitantes', value: '42', icon: UserCheck },
    { label: 'Discipulado', value: '156', icon: Heart },
    { label: 'Crescimento', value: '+12%', icon: TrendingUp },
  ]

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Paz do Senhor, Pastor!</h2>
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6 space-y-4">
            <stat.icon className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-gray-400">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}"""
}

if __name__ == "__main__":
    log("🚀 Criando estrutura do CRM...", Colors.OKBLUE)
    create_structure()

    log("📝 Criando arquivos...", Colors.OKBLUE)
    for path, content in files.items():
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        log(f"✅ {path}")

    log("📦 Instalando dependências...", Colors.OKBLUE)
    try:
        subprocess.check_call(['npm', 'install'], shell=True)
    except Exception as e:
        log(f"❌ Erro ao instalar dependências: {e}", Colors.FAIL)

    log("🚀 Iniciando servidor...", Colors.OKGREEN)
    try:
        subprocess.check_call(['npm', 'run', 'dev'], shell=True)
    except Exception as e:
        log(f"❌ Erro ao iniciar servidor: {e}", Colors.FAIL)