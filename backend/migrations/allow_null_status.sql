-- Permitir NULL no campo status da tabela tasks
ALTER TABLE tasks MODIFY COLUMN status ENUM('todo', 'in-progress', 'done') NULL;

