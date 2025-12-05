# Migrações do Banco de Dados

## Como executar as migrações

### Opção 1: Via MySQL CLI
```bash
mysql -u seu_usuario -p nome_do_banco < migrations/add_nickname_and_project_members.sql
```

### Opção 2: Via MySQL Workbench ou phpMyAdmin
1. Abra o arquivo `add_nickname_and_project_members.sql`
2. Execute o conteúdo no seu banco de dados

### Opção 3: Via Node.js (se tiver um script de migração)
```bash
node migrations/run.js
```

## Migrações disponíveis

### add_nickname_and_project_members.sql
- Adiciona a coluna `nickname` na tabela `users`
- Cria a tabela `project_members` para relacionamento muitos-para-muitos entre projetos e usuários

