# Kanban - Sistema de Gerenciamento de Projetos

Aplicação web full-stack para gerenciamento de projetos e tarefas estilo Kanban.

## 🚀 Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação segura
- **Multer** - Upload de imagens
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados

### Frontend
- **React** - Biblioteca JavaScript
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **react-beautiful-dnd** - Drag and drop
- **CSS3** - Estilização responsiva

## 📁 Estrutura do Projeto

```
PROJECTHUB/
├── backend/
│   ├── src/
│   │   ├── models/          # Modelos do MongoDB
│   │   ├── routes/          # Rotas da API
│   │   ├── middleware/      # Middlewares (auth, upload)
│   │   ├── config/          # Configurações
│   │   └── server.js        # Servidor Express
│   ├── uploads/             # Imagens enviadas
│   ├── env.example          # Exemplo de variáveis de ambiente
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços (API)
│   │   ├── context/         # Context API (Auth)
│   │   └── App.js           # Componente principal
│   ├── public/              # Arquivos públicos
│   ├── .env.example         # Exemplo de variáveis de ambiente
│   └── package.json
└── README.md
```

## 📦 Instalação

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor:
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

O backend estará rodando em `http://localhost:5000`

### Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (opcional):
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite se necessário (padrão: http://localhost:5000/api)
```

4. Inicie a aplicação:
```bash
npm start
```

O frontend estará rodando em `http://localhost:3000`

## ✨ Funcionalidades

### Autenticação
- ✅ Cadastro de usuários
- ✅ Login com JWT
- ✅ Proteção de rotas
- ✅ Validação de dados

### Projetos
- ✅ Criar, editar e deletar projetos
- ✅ Personalização de cores
- ✅ Upload de logos/imagens
- ✅ Listagem de projetos do usuário

### Tarefas
- ✅ Criar, editar e deletar tarefas
- ✅ Organização em colunas Kanban:
  - A Fazer
  - Em Progresso
  - Concluído
- ✅ Drag and drop entre colunas
- ✅ Reordenação de tarefas
- ✅ Descrição e detalhes

### Interface
- ✅ Design moderno e intuitivo
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Animações suaves
- ✅ Feedback visual

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kanban
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual

### Projetos
- `GET /api/projects` - Listar projetos
- `GET /api/projects/:id` - Obter projeto
- `POST /api/projects` - Criar projeto
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto
- `POST /api/projects/:id/logo` - Upload de logo

### Tarefas
- `GET /api/tasks/project/:projectId` - Listar tarefas do projeto
- `POST /api/tasks` - Criar tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `PUT /api/tasks/:id/move` - Mover tarefa (drag and drop)
- `DELETE /api/tasks/:id` - Deletar tarefa

## 🎨 Personalização

Os projetos podem ser personalizados com:
- **Cores**: Escolha entre paleta pré-definida ou cor customizada
- **Logos**: Upload de imagens (JPG, PNG, GIF, SVG, WEBP)
- **Descrição**: Texto descritivo do projeto

## 🐛 Troubleshooting

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme a URI no arquivo `.env`
- Para MongoDB Atlas, verifique as configurações de rede

### Erro CORS
- Certifique-se de que o backend está rodando na porta 5000
- Verifique as configurações de CORS no backend

### Erro de autenticação
- Verifique se o token JWT está sendo enviado corretamente
- Confirme o JWT_SECRET no backend

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

