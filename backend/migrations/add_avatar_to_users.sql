-- Migração para adicionar campo avatar na tabela users

-- Adicionar coluna avatar na tabela users
ALTER TABLE `users` 
ADD COLUMN `avatar` VARCHAR(255) NULL AFTER `nickname`;

