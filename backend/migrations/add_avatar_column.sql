-- Migração para adicionar campo avatar na tabela users
-- Esta migração verifica se a coluna já existe antes de adicionar

-- Adicionar coluna avatar na tabela users (se não existir)
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'avatar';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) NULL AFTER nickname')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

