# 🚀 Guia Rápido de Deploy para Produção

Este guia resume os passos essenciais para fazer deploy do ProjectHub em produção.

## ⚠️ Importante: Separação de Ambientes

**SEMPRE** use bancos de dados separados para desenvolvimento e produção!

### Opção Recomendada: Mesmo Cluster, Bancos Diferentes

- **Desenvolvimento**: `kanban_dev`
- **Produção**: `kanban_prod`

## 📋 Checklist Pré-Deploy

- [ ] Cluster MongoDB Atlas configurado
- [ ] Banco de dados de produção criado (`kanban_prod`)
- [ ] Usuário específico para produção criado
- [ ] Acesso de rede configurado (apenas IPs do servidor)
- [ ] Backups automáticos ativados
- [ ] Servidor de produção preparado (Node.js instalado)
- [ ] Domínio e SSL configurados

## 🔧 Passos de Deploy

### 1. Configurar MongoDB Atlas para Produção

```bash
# No MongoDB Atlas:
1. Acesse seu cluster
2. Crie usuário específico para produção
3. Configure Network Access apenas para IP do servidor
4. Obtenha a string de conexão
5. Adicione /kanban_prod no final da string
```

### 2. Configurar Variáveis de Ambiente no Servidor

```bash
# No servidor de produção
cd /caminho/do/projeto/backend
nano .env
```

**Conteúdo do `.env` de produção:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://prod_user:senha_forte@cluster.mongodb.net/kanban_prod?retryWrites=true&w=majority
JWT_SECRET=chave_super_secreta_diferente_da_dev_gerada_com_openssl
NODE_ENV=production
```

**Gerar JWT Secret seguro:**
```bash
openssl rand -base64 32
```

### 3. Deploy do Backend

```bash
# Instalar dependências
cd backend
npm install --production

# Iniciar com PM2
npm install -g pm2
pm2 start src/server.js --name projecthub-api
pm2 save
pm2 startup
```

### 4. Deploy do Frontend

```bash
# Build de produção
cd frontend
npm install
npm run build

# Configurar .env
echo "REACT_APP_API_URL=https://api.seudominio.com/api" > .env

# Servir com nginx ou outro servidor web
# O build fica em frontend/build/
```

### 5. Configurar Nginx (Exemplo)

```nginx
# /etc/nginx/sites-available/projecthub
server {
    listen 80;
    server_name seudominio.com;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seudominio.com;
    
    ssl_certificate /caminho/do/certificado.crt;
    ssl_certificate_key /caminho/do/private.key;
    
    # Frontend
    location / {
        root /caminho/do/projeto/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Segurança em Produção

1. ✅ Use senhas fortes e diferentes
2. ✅ Restrinja acesso de rede no MongoDB
3. ✅ Use HTTPS sempre
4. ✅ Configure CORS apenas para seu domínio
5. ✅ Monitore logs e erros
6. ✅ Configure backups automáticos
7. ✅ Use variáveis de ambiente (nunca hardcode)

## 📊 Monitoramento

```bash
# Ver logs do PM2
pm2 logs projecthub-api

# Monitorar recursos
pm2 monit

# Ver status
pm2 status
```

## 🔄 Atualizações

```bash
# Fazer pull das atualizações
git pull origin main

# Reinstalar dependências (se necessário)
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# Reiniciar aplicação
pm2 restart projecthub-api
```

## 🆘 Rollback

Se algo der errado:

```bash
# Voltar para commit anterior
git checkout <commit-hash>

# Reinstalar e reiniciar
npm install --production
pm2 restart projecthub-api
```

---

**Lembre-se:** Sempre teste em ambiente de staging antes de produção!


