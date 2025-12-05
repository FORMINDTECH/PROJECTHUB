# ProjectHub 🚀

Sistema completo de gerenciamento de projetos e tarefas estilo Kanban, desenvolvido para organizar e acompanhar o trabalho da equipe de forma visual e intuitiva.

## 📋 Sobre o Projeto

O **ProjectHub** é uma aplicação web full-stack que permite:
- Gerenciar múltiplos projetos
- Organizar tarefas em colunas Kanban (A Fazer, Em Progresso, Concluído)
- Personalizar projetos com cores e logos
- Arrastar e soltar tarefas entre colunas
- Acompanhar o progresso visualmente

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** (v14+) - Runtime JavaScript server-side
- **Express.js** - Framework web minimalista e flexível para Node.js
- **MySQL** - Banco de dados relacional
- **Sequelize** - ORM (Object-Relational Mapping) para MySQL
- **JSON Web Token (JWT)** - Autenticação segura e stateless
- **bcryptjs** - Biblioteca para hash de senhas
- **Multer** - Middleware para upload de arquivos/imagens
- **express-validator** - Validação de dados de entrada
- **dotenv** - Gerenciamento de variáveis de ambiente
- **CORS** - Controle de acesso entre origens

### Frontend
- **React** (v18) - Biblioteca JavaScript para construção de interfaces
- **React Router DOM** - Roteamento e navegação
- **Axios** - Cliente HTTP para comunicação com a API
- **react-beautiful-dnd** - Biblioteca para drag and drop
- **Context API** - Gerenciamento de estado global (autenticação)
- **CSS3** - Estilização moderna e responsiva

---

## 📁 Estrutura do Projeto

```
PROJECTHUB/
├── backend/
│   ├── src/
│   │   ├── models/          # Modelos Sequelize (User, Project, Task)
│   │   ├── routes/          # Rotas da API REST
│   │   ├── middleware/      # Middlewares (auth, upload)
│   │   ├── config/          # Configurações do banco
│   │   └── server.js        # Servidor Express principal
│   ├── uploads/             # Diretório para imagens enviadas
│   ├── env.example          # Exemplo de variáveis de ambiente
│   └── package.json         # Dependências do backend
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços de API
│   │   ├── context/         # Context API (AuthContext)
│   │   └── App.js           # Componente raiz
│   ├── public/              # Arquivos estáticos
│   └── package.json         # Dependências do frontend
│
└── README.md                # Este arquivo
```

---

## 🚀 Guia de Instalação para Novos Membros

Este guia é para membros da equipe que vão fazer clone do repositório e começar a trabalhar no projeto.

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 14 ou superior)
  - Download: https://nodejs.org/
  - Verificar instalação: `node --version`
- **npm** (vem com Node.js)
  - Verificar: `npm --version`
- **Git** (para clonar o repositório)
  - Download: https://git-scm.com/
- **MySQL** (local ou serviço cloud)
  - Download local: https://dev.mysql.com/downloads/mysql/
  - Ou use serviços cloud: AWS RDS, PlanetScale, Railway, etc.

---

## 📥 Passo 1: Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/FORMINDTECH/PROJECTHUB.git

# Entre na pasta do projeto
cd PROJECTHUB
```

---

## 🔧 Passo 2: Configurar o Backend

### 2.1 Instalar Dependências

```bash
# Entre na pasta do backend
cd backend

# Instale todas as dependências
npm install
```

### 2.2 Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Abra o arquivo .env no seu editor favorito
# (não commite este arquivo - ele contém informações sensíveis)
```

### 2.3 Configurar MySQL

**⚠️ IMPORTANTE:** Você precisa ter MySQL instalado localmente ou acesso a um serviço MySQL (cloud ou servidor da empresa).

#### Opção A: MySQL Local (Recomendado para desenvolvimento)

**1. Instalar MySQL**
   - **Windows**: Baixe o instalador em https://dev.mysql.com/downloads/mysql/
   - **Mac**: `brew install mysql` ou baixe o instalador
   - **Linux**: `sudo apt-get install mysql-server` (Ubuntu/Debian)

**2. Iniciar MySQL**
   - **Windows**: O MySQL geralmente inicia automaticamente como serviço
   - **Mac/Linux**: `sudo systemctl start mysql` ou `brew services start mysql`

**3. Criar Banco de Dados**
   ```sql
   mysql -u root -p
   CREATE DATABASE kanban CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'kanban_user'@'localhost' IDENTIFIED BY 'sua_senha_aqui';
   GRANT ALL PRIVILEGES ON kanban.* TO 'kanban_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

**4. Configurar no Arquivo .env**

Abra o arquivo `backend/.env` e configure:

```env
PORT=5000

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kanban
DB_USER=kanban_user
DB_PASSWORD=sua_senha_aqui

# JWT Secret - Use uma string aleatória e segura
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao

NODE_ENV=development
```

#### Opção B: MySQL Cloud (Recomendado para produção)

Você pode usar serviços cloud como:
- **AWS RDS** - https://aws.amazon.com/rds/mysql/
- **PlanetScale** - https://planetscale.com/ (tem plano gratuito)
- **Railway** - https://railway.app/ (tem plano gratuito)
- **DigitalOcean Managed Databases**
- **Google Cloud SQL**

**Configuração no .env para cloud:**
```env
PORT=5000

# MySQL Cloud Configuration
DB_HOST=seu-host-mysql.cloud.com
DB_PORT=3306
DB_NAME=kanban
DB_USER=seu_usuario
DB_PASSWORD=sua_senha_segura

JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao
NODE_ENV=development
```

**💡 Dica:** O Sequelize criará automaticamente as tabelas na primeira execução!

### 2.4 Testar o Backend

```bash
# Inicie o servidor
npm start

# Você deve ver:
# ✅ Conectado ao MySQL
# 🚀 Servidor rodando na porta 5000
```

Se aparecer erro de conexão, verifique:
- ✅ A string de conexão está correta no `.env`
- ✅ O usuário e senha estão corretos
- ✅ O acesso de rede está configurado no Atlas (Network Access)
- ✅ O cluster está ativo

---

## 🎨 Passo 3: Configurar o Frontend

### 3.1 Instalar Dependências

```bash
# Volte para a raiz do projeto
cd ..

# Entre na pasta do frontend
cd frontend

# Instale todas as dependências
npm install
```

### 3.2 Configurar Variáveis de Ambiente (Opcional)

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# O padrão já está configurado para http://localhost:5000/api
# Só edite se o backend estiver em outra porta
```

### 3.3 Iniciar o Frontend

```bash
# Inicie a aplicação React
npm start

# O navegador abrirá automaticamente em http://localhost:3000
```

---

## ✅ Verificação Final

Após seguir todos os passos, você deve ter:

1. ✅ Backend rodando em `http://localhost:5000`
2. ✅ Frontend rodando em `http://localhost:3000`
3. ✅ Conexão com MySQL estabelecida
4. ✅ Aplicação funcionando no navegador

---

## 🎯 Como Usar a Aplicação

### Primeiro Acesso

1. **Criar Conta**
   - Acesse `http://localhost:3000`
   - Clique em "Cadastre-se"
   - Preencha: Nome, Email e Senha
   - Clique em "Criar Conta"

2. **Criar Primeiro Projeto**
   - Após fazer login, clique em "+ Novo Projeto"
   - Preencha o nome do projeto
   - Escolha uma cor
   - (Opcional) Adicione uma descrição
   - Clique em "Salvar"

3. **Adicionar Tarefas**
   - Clique no projeto criado
   - Clique em "+ Nova Tarefa"
   - Preencha o título
   - (Opcional) Adicione descrição
   - Escolha o status inicial
   - Clique em "Salvar"

4. **Mover Tarefas**
   - Arraste e solte tarefas entre as colunas
   - A ordem é salva automaticamente

---

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual (requer autenticação)

### Projetos
- `GET /api/projects` - Listar projetos do usuário
- `GET /api/projects/:id` - Obter projeto específico
- `POST /api/projects` - Criar novo projeto
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto
- `POST /api/projects/:id/logo` - Upload de logo do projeto

### Tarefas
- `GET /api/tasks/project/:projectId` - Listar tarefas de um projeto
- `POST /api/tasks` - Criar nova tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `PUT /api/tasks/:id/move` - Mover tarefa (drag and drop)
- `DELETE /api/tasks/:id` - Deletar tarefa

---

## 🔐 Variáveis de Ambiente

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kanban?retryWrites=true&w=majority
JWT_SECRET=sua_chave_secreta_jwt_aqui
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**⚠️ IMPORTANTE:** 
- Nunca commite arquivos `.env` no Git
- Eles contêm informações sensíveis (senhas, tokens)
- Use `.env.example` como referência

---

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED" ao conectar MySQL

**Causa:** MySQL não está rodando ou configuração incorreta.

**Solução:**
- Verifique se o MySQL está rodando: `sudo systemctl status mysql` (Linux) ou serviços do Windows
- Confirme as variáveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` no `.env`
- Teste a conexão: `mysql -u DB_USER -p -h DB_HOST`
- Verifique se o banco de dados foi criado: `SHOW DATABASES;`

### Erro: "Access denied" no MySQL

**Causa:** Credenciais incorretas ou usuário sem permissões.

**Solução:**
- Verifique usuário e senha no `.env`
- Confirme que o usuário tem permissões: `GRANT ALL PRIVILEGES ON kanban.* TO 'usuario'@'localhost';`
- Verifique se o usuário pode acessar de localhost ou do IP correto

### Erro: "Token inválido" ou "Não autorizado"

**Causa:** Token JWT expirado ou inválido.

**Solução:**
- Faça logout e login novamente
- Verifique se o `JWT_SECRET` está configurado no backend
- Limpe o localStorage do navegador

### Erro CORS no navegador

**Causa:** Backend não está rodando ou porta incorreta.

**Solução:**
- Certifique-se de que o backend está rodando na porta 5000
- Verifique se a URL da API está correta no frontend
- Reinicie ambos os servidores

### Porta já em uso

**Causa:** Outro processo está usando a porta.

**Solução:**
```bash
# Windows - Encontrar processo na porta 5000
netstat -ano | findstr :5000

# Matar processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F

# Ou mude a porta no arquivo .env
```

---

## 🚀 Configuração para Produção

### MySQL é adequado para produção?

**✅ SIM!** MySQL é **amplamente usado em produção** por empresas de todos os tamanhos, incluindo Facebook, Twitter, YouTube, e muitas outras. Vantagens:

- ✅ **Confiabilidade**: Banco de dados relacional maduro e estável
- ✅ **Performance**: Otimizado para leitura e escrita intensiva
- ✅ **Escalabilidade**: Suporta milhões de registros e transações
- ✅ **Segurança**: Criptografia, autenticação e controle de acesso robustos
- ✅ **Backups**: Ferramentas nativas de backup e restauração
- ✅ **Suporte**: Grande comunidade e documentação extensa
- ✅ **Cloud Ready**: Disponível em todos os principais provedores cloud

**Opções de hospedagem:**
- **MySQL Local**: Para desenvolvimento e pequenos projetos
- **AWS RDS**: Gerenciado pela Amazon, escalável e confiável
- **PlanetScale**: MySQL serverless com plano gratuito
- **DigitalOcean Managed Databases**: Simples e acessível
- **Google Cloud SQL**: Gerenciado pelo Google

**💡 Dica:** Você pode usar o mesmo MySQL tanto em desenvolvimento quanto em produção, apenas separando os bancos de dados ou usando instâncias diferentes.

### Por que separar Desenvolvimento e Produção?

**⚠️ IMPORTANTE:** É **altamente recomendado** usar bancos de dados separados para desenvolvimento e produção pelos seguintes motivos:

1. **Segurança**: Dados de produção não devem ser acessados durante desenvolvimento
2. **Estabilidade**: Testes não devem afetar dados reais dos usuários
3. **Performance**: Desenvolvimento pode ter queries pesadas que não devem impactar produção
4. **Backup**: Dados de produção precisam de backups mais frequentes
5. **Compliance**: Separação de ambientes é uma boa prática de segurança

### Opções de Configuração

Você tem **duas opções principais**:

#### Opção 1: Mesma Instância MySQL, Bancos Diferentes (Recomendado para começar)

**Vantagens:**
- ✅ Mais econômico (usa a mesma instância)
- ✅ Mais simples de gerenciar
- ✅ Ideal para projetos pequenos/médios

**Como configurar:**

1. Use a **mesma instância MySQL** para ambos os ambientes
2. Configure bancos de dados diferentes:
   - Desenvolvimento: `kanban_dev`
   - Produção: `kanban_prod`

3. **Arquivo `.env` de Desenvolvimento:**
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=kanban_dev
   DB_USER=kanban_user
   DB_PASSWORD=senha_dev
   JWT_SECRET=chave_secreta_desenvolvimento
   NODE_ENV=development
   ```

4. **Arquivo `.env` de Produção** (no servidor):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=kanban_prod
   DB_USER=kanban_user
   DB_PASSWORD=senha_forte_producao
   JWT_SECRET=chave_secreta_producao_super_forte_e_diferente
   NODE_ENV=production
   ```

#### Opção 2: Instâncias Separadas (Recomendado para produção)

**Vantagens:**
- ✅ Máxima segurança e isolamento
- ✅ Performance otimizada para cada ambiente
- ✅ Escalabilidade independente
- ✅ Backup e manutenção separados

**Como configurar:**

1. **Criar Instância de Produção:**
   - Use AWS RDS, PlanetScale, DigitalOcean ou outro serviço
   - Configure acesso apenas para IPs do servidor de produção
   - Crie usuário específico para produção
   - Configure backups automáticos

2. **Configurar Variáveis de Ambiente no Servidor:**

   **Desenvolvimento (local):**
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=kanban_dev
   DB_USER=dev_user
   DB_PASSWORD=senha_dev
   JWT_SECRET=chave_dev
   NODE_ENV=development
   ```

   **Produção (servidor):**
   ```env
   PORT=5000
   DB_HOST=seu-mysql-prod.rds.amazonaws.com
   DB_PORT=3306
   DB_NAME=kanban_prod
   DB_USER=prod_user
   DB_PASSWORD=senha_forte_producao
   JWT_SECRET=chave_super_secreta_producao_aleatoria_123456789
   NODE_ENV=production
   ```

### Configurando no Servidor de Produção

#### Passo 1: Preparar o Servidor

```bash
# No servidor de produção, clone o repositório
git clone https://github.com/FORMINDTECH/PROJECTHUB.git
cd PROJECTHUB

# Instale dependências
cd backend && npm install --production
cd ../frontend && npm install && npm run build
```

#### Passo 2: Configurar Variáveis de Ambiente

```bash
# Crie o arquivo .env no servidor
cd backend
cp env.example .env
nano .env  # ou use seu editor preferido
```

**Configure com as credenciais de PRODUÇÃO:**
```env
PORT=5000
DB_HOST=seu-mysql-prod.rds.amazonaws.com
DB_PORT=3306
DB_NAME=kanban_prod
DB_USER=prod_user
DB_PASSWORD=senha_forte_producao
JWT_SECRET=chave_super_secreta_diferente_da_dev
NODE_ENV=production
```

#### Passo 3: Configurar Frontend

```bash
cd ../frontend
cp .env.example .env
nano .env
```

**Configure a URL da API de produção:**
```env
REACT_APP_API_URL=https://api.seudominio.com/api
```

#### Passo 4: Iniciar Aplicação

**Backend (com PM2 ou similar):**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
cd backend
pm2 start src/server.js --name projecthub-api

# Salvar configuração
pm2 save
pm2 startup
```

**Frontend (servir build estático):**
```bash
# O build já foi criado com npm run build
# Sirva com nginx, Apache ou outro servidor web
```

### Boas Práticas de Segurança para Produção

1. **Senhas Fortes**
   - Use senhas diferentes para dev e prod
   - Use gerador de senhas aleatórias
   - Armazene em gerenciador de senhas seguro

2. **JWT Secret**
   - Use uma string aleatória longa e complexa
   - **NUNCA** use a mesma chave em dev e prod
   - Gere com: `openssl rand -base64 32`

3. **Acesso de Rede**
   - Em produção, restrinja IPs no MongoDB Atlas
   - Adicione apenas IPs do servidor de produção
   - Remova `0.0.0.0/0` em produção

4. **Usuários do Banco**
   - Crie usuários separados para dev e prod
   - Use permissões mínimas necessárias
   - Revise permissões periodicamente

5. **Backups**
   - Configure backups automáticos no Atlas
   - Teste restauração periodicamente
   - Mantenha backups em local seguro

6. **Monitoramento**
   - Configure alertas no MongoDB Atlas
   - Monitore performance e uso
   - Configure logs de erro

7. **HTTPS**
   - Use certificado SSL em produção
   - Force HTTPS em todas as conexões
   - Configure CORS corretamente

### Checklist de Deploy

Antes de fazer deploy em produção, verifique:

- [ ] Banco de dados de produção criado e configurado
- [ ] Variáveis de ambiente configuradas no servidor
- [ ] JWT_SECRET diferente do desenvolvimento
- [ ] Acesso de rede restrito no MySQL (firewall/security groups)
- [ ] Usuário do banco criado especificamente para produção
- [ ] Backups configurados no MySQL
- [ ] Conexão SSL configurada para MySQL
- [ ] HTTPS configurado
- [ ] CORS configurado para domínio de produção
- [ ] Logs de erro configurados
- [ ] Monitoramento ativo
- [ ] Testes realizados em ambiente de staging (se houver)

---

## 📊 Visualizar Dados no MySQL

### Opção 1: MySQL Workbench (Recomendado)

1. Baixe: https://dev.mysql.com/downloads/workbench/
2. Instale o aplicativo
3. Crie uma nova conexão com as credenciais do `.env`
4. Explore as tabelas: `users`, `projects`, `tasks`

### Opção 2: phpMyAdmin (Web Interface)

1. Instale phpMyAdmin ou use uma instância web
2. Acesse via navegador
3. Faça login com as credenciais do MySQL
4. Selecione o banco `kanban` e explore as tabelas

### Opção 3: Linha de Comando

```bash
mysql -u DB_USER -p -h DB_HOST
USE kanban;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM projects;
SELECT * FROM tasks;
```

---

## 🚀 Scripts Disponíveis

### Backend

```bash
npm start          # Inicia o servidor em produção
npm run dev        # Inicia o servidor em desenvolvimento (com nodemon)
```

### Frontend

```bash
npm start          # Inicia o servidor de desenvolvimento
npm run build      # Cria build de produção
npm test           # Executa testes
```

---

## 📚 Recursos Adicionais

- [Documentação MySQL](https://dev.mysql.com/doc/)
- [Documentação Sequelize](https://sequelize.org/)
- [Documentação Express.js](https://expressjs.com/)
- [Documentação React](https://react.dev/)

---

## 👥 Contribuindo

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Faça commit das mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Faça push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é propriedade da **Formind.tech** e está disponível para uso interno da empresa.

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Consulte este README primeiro
2. Verifique a seção de Troubleshooting
3. Entre em contato com o líder técnico da equipe
4. Abra uma issue no repositório

---

**Desenvolvido com ❤️ pela equipe Formind.tech**

**© 2025 Formind.tech - Todos os direitos reservados**
