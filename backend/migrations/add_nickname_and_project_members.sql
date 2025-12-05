-- Migração para adicionar campo nickname na tabela users
-- e criar tabela project_members

-- Adicionar coluna nickname na tabela users
ALTER TABLE `users` 
ADD COLUMN `nickname` VARCHAR(255) NULL AFTER `password`;

-- Criar tabela project_members
CREATE TABLE IF NOT EXISTS `project_members` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_members_project_id_user_id_unique` (`project_id`, `user_id`),
  KEY `project_members_project_id` (`project_id`),
  KEY `project_members_user_id` (`user_id`),
  CONSTRAINT `project_members_project_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_members_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

