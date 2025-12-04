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
- **MongoDB Atlas** - Banco de dados NoSQL em nuvem (gratuito)
- **Mongoose** - ODM (Object Data Modeling) para MongoDB
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
│   │   ├── models/          # Modelos do MongoDB (User, Project, Task)
│   │   ├── routes/          # Rotas da API REST
│   │   ├── middleware/      # Middlewares (auth, upload)
│   │   ├── config/          # Configurações do banco
│   │   └── server.js        # Servidor Express principal
│   ├── uploads/             # Diretório para imagens enviadas
│   ├── env.example          # Exemplo de variáveis de ambiente
│   ├── configure-mongodb.sh # Script auxiliar de configuração
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
- **Conta no MongoDB Atlas** (gratuita)
  - Criar em: https://www.mongodb.com/cloud/atlas/register

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

### 2.3 Configurar MongoDB Atlas

**⚠️ IMPORTANTE:** Você precisa ter acesso ao MongoDB Atlas da empresa ou criar sua própria conta.

#### Opção A: Usar MongoDB Atlas da Empresa

Se a empresa já tem um cluster configurado, peça as credenciais ao líder técnico:
- Username do banco de dados
- Password do banco de dados
- String de conexão completa

#### Opção B: Criar Sua Própria Conta (Recomendado para desenvolvimento)

Siga estes passos detalhados:

**1. Criar Conta no MongoDB Atlas**
   - Acesse: https://www.mongodb.com/cloud/atlas/register
   - Crie uma conta gratuita (plano FREE é suficiente)

**2. Criar um Cluster**
   - Após fazer login, clique em **"Build a Database"**
   - Escolha o plano **FREE (M0)**
   - Selecione uma região próxima (ex: São Paulo)
   - Clique em **"Create"**
   - Aguarde alguns minutos enquanto o cluster é criado

**3. Configurar Acesso de Rede**
   - No menu lateral, clique em **"Network Access"**
   - Clique em **"Add IP Address"**
   - Para desenvolvimento, adicione `0.0.0.0/0` (permite acesso de qualquer lugar)
   - Ou adicione seu IP específico para mais segurança
   - Clique em **"Confirm"**

**4. Criar Usuário do Banco de Dados**
   - No menu lateral, clique em **"Database Access"**
   - Clique em **"Add New Database User"**
   - Escolha **"Password"** como método de autenticação
   - Crie um username (ex: `dev_user`)
   - Crie uma senha forte (anote em local seguro!)
   - Em **"Database User Privileges"**, escolha **"Read and write to any database"**
   - Clique em **"Add User"**

**5. Obter String de Conexão**
   - Volte para o dashboard e clique em **"Connect"** no seu cluster
   - Escolha **"Connect your application"**
   - Você verá uma string como esta:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **⚠️ ATENÇÃO:** Os símbolos `< >` são placeholders! Você precisa substituir:
     - `<username>` pelo username que você criou (SEM os símbolos `<>`)
     - `<password>` pela senha que você criou (SEM os símbolos `<>`)
   - Adicione o nome do banco `/kanban` ANTES do `?`
   
   **Exemplo:**
   - Se você criou: username=`dev_user`, password=`MinhaSenh@123`
   - Cluster: `cluster0.abc123.mongodb.net`
   - String final:
     ```
     mongodb+srv://dev_user:MinhaSenh@123@cluster0.abc123.mongodb.net/kanban?retryWrites=true&w=majority
     ```
   
   **⚠️ Se sua senha tiver caracteres especiais** (`@`, `#`, `:`, `/`, `*`), você precisa codificá-los:
   - `@` → `%40`
   - `#` → `%23`
   - `:` → `%3A`
   - `/` → `%2F`
   - `*` → `%2A`

**6. Configurar no Arquivo .env**

Abra o arquivo `backend/.env` e configure assim:

```env
PORT=5000

# MongoDB Atlas - Cole a string completa aqui
MONGODB_URI=mongodb+srv://seu_username:sua_senha@cluster0.xxxxx.mongodb.net/kanban?retryWrites=true&w=majority

# JWT Secret - Use uma string aleatória e segura
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao

NODE_ENV=development
```

**Exemplo completo:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://dev_user:MinhaSenh@123@cluster0.abc123.mongodb.net/kanban?retryWrites=true&w=majority
JWT_SECRET=minha_chave_secreta_jwt_123456
NODE_ENV=development
```

### 2.4 Testar o Backend

```bash
# Inicie o servidor
npm start

# Você deve ver:
# ✅ Conectado ao MongoDB
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
3. ✅ Conexão com MongoDB Atlas estabelecida
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

### Erro: "ECONNREFUSED" ao conectar MongoDB

**Causa:** MongoDB não está rodando ou string de conexão incorreta.

**Solução:**
- Verifique se a string `MONGODB_URI` está correta no `.env`
- Confirme que o usuário e senha estão corretos
- Verifique se o acesso de rede está configurado no MongoDB Atlas
- Teste a conexão diretamente no MongoDB Atlas

### Erro: "Invalid scheme" na conexão MongoDB

**Causa:** String de conexão malformada.

**Solução:**
- Verifique se a string começa com `mongodb+srv://`
- Confirme que não há espaços extras
- Verifique se a senha está codificada corretamente (caracteres especiais)

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

## 📊 Visualizar Dados no MongoDB

### Opção 1: MongoDB Atlas Web Interface

1. Acesse: https://cloud.mongodb.com
2. Faça login
3. Clique no seu cluster
4. Clique em **"Browse Collections"**
5. Expanda o banco `kanban`
6. Veja as coleções: `users`, `projects`, `tasks`

### Opção 2: MongoDB Compass

1. Baixe: https://www.mongodb.com/try/download/compass
2. Instale o aplicativo
3. Cole a string de conexão do Atlas
4. Explore os dados visualmente

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

- [Documentação MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Documentação Express.js](https://expressjs.com/)
- [Documentação React](https://react.dev/)
- [Documentação Mongoose](https://mongoosejs.com/)

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
