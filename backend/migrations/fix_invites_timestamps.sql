-- Corrigir nomes das colunas de timestamp para snake_case
ALTER TABLE project_invites 
  CHANGE COLUMN createdAt created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN updatedAt updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

