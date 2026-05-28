import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ["**/*.log", "**/.git/**"],
    },
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "/src": path.resolve(__dirname, "./src"),
    },
  },
});

//toda vez que quiser usar wifi tenho que configurar o vite inserindo o host: true e port: 5173,
//  para que ele possa ser acessado por outros dispositivos na mesma rede, 
// como celulares ou outros computadores. 
// Sem essa configuração, o servidor de desenvolvimento do Vite só estará acessível 
// localmente (localhost) e não poderá ser acessado por outros dispositivos na rede.

//depois no terminal, para rodar o projeto, basta usar o comando "npm run dev" 
// ou "yarn dev" e ele irá iniciar o servidor de desenvolvimento do Vite com as 
// configurações especificadas. depois acessar o http://<IP_DO_SEU_COMPUTADOR>:5173
//  no navegador do dispositivo que deseja acessar o projeto.

//observar se o backend está rodando. se bão cd backend, npm start 
//http://localhost:3001/api/network-info
//curl http://localhost:3001/api/network-info   digitar isso no terminal para verificar 
// se o backend está respondendo corretamente.

//fechar as portas Stop-Process -Id 28236,16968  -Force
//ver quais portas estão abertas  netstat -ano | findstr ":3001 :5173"   