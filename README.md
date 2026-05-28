# 🕊️ Eclesia CRM - Sistema de Gestão Pastoral Premium

O **Eclesia CRM** é uma plataforma moderna e completa de gestão ministerial desenvolvida sob medida para pastores, líderes de células e igrejas. Projetado com uma interface visualmente impressionante no estilo dark-mode com glassmorphism, o sistema centraliza o cadastro de membros, o acompanhamento de visitantes, o controle financeiro e o envio instantâneo de comunicações via WhatsApp e E-mail.

Além disso, o sistema conta com uma máquina de vendas integrada na Landing Page que oferece um **Teste Premium de 24 horas** para novos pastores, impulsionando a conversão para planos anuais e licenças vitalícias.

---

## ✨ Principais Funcionalidades

- **📊 Dashboard Dinâmico em Tempo Real:** Estatísticas vivas e sincronizadas com os módulos do sistema (Membros, Visitantes, Discipulado e Finanças), com gráfico interativo de crescimento de culto e feed de atividades recentes.
- **👥 Gestão de Membros & Liderança:** Cadastro completo com fotos, indicação de cargos (Pastor, Diácono, Obreiro, Líder, Membro), controle de células, datas de nascimento e batismo.
- **🤝 Cuidado com Visitantes:** Rastreamento de novos visitantes com status de consolidação ("Pendente", "Acompanhado", "Decidido", "Afastado") e anotações pastorais.
- **💞 Duplas de Discipulado:** Emparelhamento de mentores (discipuladores) com novos convertidos (discípulos) para acompanhamento espiritual de perto.
- **💰 Lançamentos Financeiros:** Gestão segura de dízimos, ofertas e doações de missões com cálculo automático do balanço total em tempo real.
- **🚀 Disparo Automático via WhatsApp API:** Conexão direta via servidor com APIs profissionais (Evolution API, WPPConnect, Baileys ou Meta Cloud API) para disparar devocionais e felicitações de aniversário em 1 clique, sem abrir abas do navegador.
- **⏱️ Gestão de Teste (Trial de 24h):** Cronômetro em tempo real no topo da tela. Quando o período de teste de 1 dia encerra, o acesso é automaticamente bloqueado por um modal imersivo de conversão e contato comercial.

---

## 🏗️ Arquitetura do Sistema

O projeto é dividido em duas camadas principais que trabalham juntas:

1. **Frontend (Interface Web):** Desenvolvido em React + Vite + TypeScript e estilizado com Tailwind CSS. Roda por padrão na porta **`5173`**.
2. **Backend (Servidor de Mensageria e OTP):** Desenvolvido em Node.js com Express, Axios e Nodemailer. Responsável pelo envio de e-mails de recuperação e pelo disparo silencioso de mensagens de WhatsApp. Roda na porta **`3001`**.

---

## 🚀 Como Instalar e Rodar Localmente (Passo a Passo)

Para rodar a aplicação na sua máquina, você precisará abrir **dois terminais no Windows (PowerShell ou Prompt de Comando)**: um para ligar o Backend e outro para ligar o Frontend.

### Passo 1: Iniciar o Backend (Servidor Node.js - Porta 3001)
Abra seu terminal na pasta raiz do projeto e execute:
```powershell
cd backend
npm install
```
Antes de iniciar, copie `backend/.env.example` para `backend/.env` e ajuste as variáveis necessárias.
> No PowerShell:
> ```powershell
> Copy-Item .env.example .env
> ```
```powershell
npm start
```
> **Nota:** Você verá a mensagem `🚀 Servidor de Autenticação rodando na porta 3001`. Mantenha esta janela aberta!

### Passo 2: Iniciar o Frontend (Interface React/Vite - Porta 5173)
Abra um segundo terminal na pasta raiz do projeto e execute:
```powershell
npm install
npm run dev
```
> **Nota:** O terminal exibirá o link de acesso local. Abra no seu navegador: `http://localhost:5173/`

---

## QR Code para Tablet da Recepção

O Dashboard possui um QR Code para abrir o cadastro mobile no tablet da recepção. Esse QR Code aponta para:

```text
http://IP_DO_NOTEBOOK:5173/mobile
```

Quando o tablet cadastrar membros ou visitantes, os dados serão enviados para o backend do notebook na porta `3001` e gravados localmente em:

```text
backend/members.json
backend/visitors.json
```

Para usar pelo tablet, ligue o backend normalmente:

```powershell
cd C:\Users\IIGD_Engenho_Novo\crm_3\CRM-Bom-Samaritano\backend


```

Em outro PowerShell, ligue o frontend no modo rede:

```powershell
cd C:\Users\IIGD_Engenho_Novo\crm_3\CRM-Bom-Samaritano
npm run dev:network
```

Depois abra o Dashboard no notebook, clique em **Acessar Cadastro Mobile** e escaneie o QR Code pelo tablet.

> Importante: notebook e tablet precisam estar no mesmo Wi-Fi/rede. Se o tablet não abrir, libere as portas `3001` e `5173` no Firewall do Windows.

---

## Como Parar as Portas do CRM

Quando quiser encerrar o CRM Bom Samaritano, você pode fechar os terminais onde o backend e o frontend estão rodando pressionando `Ctrl + C`.

Se precisar parar pelas portas no PowerShell, primeiro veja quais processos estão usando as portas do CRM:

```powershell
netstat -ano | findstr ":3001 :5173"
```

Procure as linhas com `LISTENING`. O último número da linha é o PID do processo:

```text
TCP    0.0.0.0:3001     0.0.0.0:0     LISTENING     29788
TCP    127.0.0.1:5173   0.0.0.0:0     LISTENING     17648
```

Para parar, use o PID encontrado:

```powershell
Stop-Process -Id 29788,17648 -Force
```

Depois confira novamente:

```powershell
netstat -ano | findstr ":3001 :5173"
```

Se não aparecer nenhuma linha com `LISTENING`, as portas foram fechadas.

- Porta `3001`: backend/API
- Porta `5173`: frontend/tela do sistema

---

## 🔄 Como Atualizar e Aplicar Mudanças no Sistema

Se você modificar qualquer parte do código (por exemplo, adicionar novas funções, alterar o design ou atualizar textos), siga os passos abaixo para recompilar o projeto e aplicar as mudanças perfeitamente:

### 1. Se você modificou arquivos do Frontend (na pasta `src/`):
Sempre que fizer alterações no código React/TypeScript, é recomendável rodar a validação de build para garantir que não há erros de sintaxe e gerar a versão final otimizada.
No terminal da raiz do projeto, pare o comando anterior (pressionando `Ctrl + C`) e execute:
```powershell
npm run build
```
Assim que o build compilar com sucesso indicando `✓ built in X.XXs`, basta reiniciar o servidor de desenvolvimento:
```powershell
npm run dev
```
Recarregue a página no seu navegador (pressione `F5` ou `Ctrl + F5`) para ver as novidades na hora!

### 2. Se você modificou arquivos do Backend (como `backend/server.js`):
No terminal onde o backend está rodando, pare a execução pressionando `Ctrl + C` no teclado e inicie novamente:
```powershell
npm start
```
O servidor aplicará suas novas regras na hora.

---

## 🔐 Variáveis de Ambiente e Configurações

### No Backend (`backend/.env`):
Você pode configurar os acessos de e-mail e WhatsApp criando ou ajustando o arquivo `.env` dentro da pasta `backend/`.
Uma cópia de exemplo está disponível em `backend/.env.example`.

```env
GMAIL_USER=seu-email-da-igreja@gmail.com
GMAIL_APP_PASSWORD=senha-de-app-gerada-no-google
WHATSAPP_TOKEN=token-de-acesso-da-sua-instancia
WHATSAPP_PHONE_ID=id-do-telefone
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Recuperação de senha por e-mail
O backend usa o `FRONTEND_URL` para montar o link de redefinição enviado por e-mail.
No fluxo de recuperação:
- o usuário solicita redefinição em `/login`
- o backend chama `/api/auth/forgot-password`
- o sistema envia um link para `FRONTEND_URL/reset-password?email=...&token=...`
- ao abrir o link, o usuário define nova senha
- o frontend chama `/api/auth/reset-password`

> Para testar localmente, configure `GMAIL_USER` e `GMAIL_APP_PASSWORD` com credenciais válidas de app do Gmail e mantenha o backend rodando em `http://localhost:3001`.

### No Frontend (Configurações do CRM):
Dentro do sistema, acessando o menu **Configurações** (`/app/settings`), você pode configurar facilmente a URL da sua API de WhatsApp (Ex: Evolution API) e a sua Chave Secreta para os disparos automáticos nos módulos.

### Instalação e execução profissional
No diretório raiz do projeto:
```powershell
npm install
npm run dev
```

No diretório `backend`:
```powershell
cd backend
npm install
npm start

Melhor opção: terminal 1 ---> cd backend e depois npm start
Depois : terminal 2 ---> npm run dev
```
