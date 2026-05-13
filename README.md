# ⚽ Gol Score Backend

Proxy entre o dashboard e a BSD Sports API.  
Resolve o bloqueio de CORS do browser.

---

## 🚀 Deploy no Railway (gratuito)

### Passo 1 — Criar conta
Acesse **railway.app** e crie uma conta gratuita (pode usar o Google).

### Passo 2 — Novo projeto
1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Se não tiver GitHub: selecione **"Empty project"** → **"Add a service"** → **"GitHub Repo"**

### Passo 3 — Subir o código
1. Crie um repositório no **github.com** (pode ser privado)
2. Faça upload dos arquivos desta pasta:
   - `server.js`
   - `package.json`
   - `railway.toml`
   - `.gitignore`
3. No Railway, conecte ao repositório criado

### Passo 4 — Variável de ambiente (opcional, já está no código)
No Railway → seu serviço → **Variables**:
```
BSD_API_KEY = b51ccc3678ba8ecf80a696ebdd9ba1ea7d782c31
```

### Passo 5 — Pegar a URL
Após o deploy (~1 min), vá em **Settings → Networking → Generate Domain**.  
Você receberá uma URL tipo:
```
https://gol-score-backend-production.up.railway.app
```

### Passo 6 — Colar no dashboard
Cole essa URL no campo que aparece no dashboard ao abrir.

---

## 🧪 Testar localmente

```bash
npm install
node server.js
```

Acesse: http://localhost:3001/api/dashboard

---

## 📡 Endpoints disponíveis

| Endpoint | Descrição |
|---|---|
| `GET /` | Health check |
| `GET /api/live` | Jogos ao vivo |
| `GET /api/stats/:id` | Stats de um jogo |
| `GET /api/dashboard` | Live + stats em uma chamada |
