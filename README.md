# Kanban - Sistema de Gerenciamento de Projetos

Aplicação web full-stack para gerenciamento de projetos e tarefas estilo Kanban.

## Tecnologias

### Backend
- Node.js
- Express
- MongoDB (ou SQLite para simplicidade)
- JWT para autenticação
- Multer para upload de imagens

### Frontend
- React
- React Router
- Axios
- React DnD (drag and drop)

## Estrutura do Projeto

```
PROJECTHUB/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── server.js
│   ├── uploads/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Instalação

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Funcionalidades

- ✅ Autenticação de usuários (JWT)
- ✅ CRUD de projetos
- ✅ Personalização de projetos (cores e logos)
- ✅ CRUD de tarefas
- ✅ Colunas Kanban customizáveis
- ✅ Drag and drop de tarefas
- ✅ Interface responsiva

