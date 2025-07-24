-- ========================================
-- MIGRAÇÕES INCREMENTAIS - MELHORIAS DO SCHEMA
-- ========================================

-- ========================================
-- FASE 1: ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para AccountBanks
CREATE INDEX IF NOT EXISTS "account_banks_user_id_idx" ON "account_banks"("userId");
CREATE INDEX IF NOT EXISTS "account_banks_bank_idx" ON "account_banks"("bank");
CREATE INDEX IF NOT EXISTS "account_banks_is_active_idx" ON "account_banks"("isActive");

-- Índices para Categories
CREATE INDEX IF NOT EXISTS "categories_user_id_idx" ON "categories"("userId");
CREATE INDEX IF NOT EXISTS "categories_type_idx" ON "categories"("type");
CREATE INDEX IF NOT EXISTS "categories_is_active_idx" ON "categories"("isActive");

-- Índices para Transactions
CREATE INDEX IF NOT EXISTS "transactions_user_id_idx" ON "transactions"("userId");
CREATE INDEX IF NOT EXISTS "transactions_date_idx" ON "transactions"("date");
CREATE INDEX IF NOT EXISTS "transactions_type_idx" ON "transactions"("type");
CREATE INDEX IF NOT EXISTS "transactions_category_id_idx" ON "transactions"("categoryId");
CREATE INDEX IF NOT EXISTS "transactions_account_banks_id_idx" ON "transactions"("accountBanksId");

-- Índices para Transfers
CREATE INDEX IF NOT EXISTS "transfers_user_id_idx" ON "transfers"("userId");
CREATE INDEX IF NOT EXISTS "transfers_date_idx" ON "transfers"("date");
CREATE INDEX IF NOT EXISTS "transfers_bank_initial_id_idx" ON "transfers"("bankInitialId");
CREATE INDEX IF NOT EXISTS "transfers_bank_destine_id_idx" ON "transfers"("bankDestineId");

-- Índices para User
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- ========================================
-- FASE 2: CAMPOS ADICIONAIS
-- ========================================

-- Adicionar campos em AccountBanks
ALTER TABLE "account_banks" 
ADD COLUMN IF NOT EXISTS "accountNumber" TEXT,
ADD COLUMN IF NOT EXISTS "agency" TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Adicionar campos em Categories
ALTER TABLE "categories" 
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Adicionar campos em Transactions
ALTER TABLE "transactions" 
ADD COLUMN IF NOT EXISTS "tags" TEXT[],
ADD COLUMN IF NOT EXISTS "receipt" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Adicionar campos em Transfers
ALTER TABLE "transfers" 
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Adicionar campos em User
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- ========================================
-- FASE 3: CONSTRAINTS E VALIDAÇÕES
-- ========================================

-- Constraint único para categorias por usuário
ALTER TABLE "categories" 
ADD CONSTRAINT IF NOT EXISTS "categories_user_id_name_type_key" 
UNIQUE ("userId", "name", "type");

-- ========================================
-- FASE 4: NOVOS ENUMS
-- ========================================

-- Expandir enum BankName (se necessário)
-- Nota: PostgreSQL não permite alterar enums facilmente
-- Seria necessário criar novo enum e migrar dados

-- ========================================
-- FASE 5: NOVOS MODELOS
-- ========================================

-- Tabela Goals
CREATE TABLE IF NOT EXISTS "goals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" INTEGER NOT NULL,
    "currentAmount" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- Tabela Budgets
CREATE TABLE IF NOT EXISTS "budgets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "spent" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "categoryId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- Tabela Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Tabela RecurringTransactions
CREATE TABLE IF NOT EXISTS "recurring_transactions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "accountBanksId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "lastExecuted" TIMESTAMP(3),
    "nextExecution" TIMESTAMP(3),

    CONSTRAINT "recurring_transactions_pkey" PRIMARY KEY ("id")
);

-- Tabela AuditLog
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- ========================================
-- FASE 6: RELACIONAMENTOS
-- ========================================

-- Foreign keys para Goals
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys para Budgets
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" 
FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys para Notifications
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys para RecurringTransactions
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_user_id_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_category_id_fkey" 
FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_account_banks_id_fkey" 
FOREIGN KEY ("accountBanksId") REFERENCES "account_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign keys para AuditLog
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- FASE 7: ÍNDICES PARA NOVAS TABELAS
-- ========================================

-- Índices para Goals
CREATE INDEX IF NOT EXISTS "goals_user_id_idx" ON "goals"("userId");
CREATE INDEX IF NOT EXISTS "goals_status_idx" ON "goals"("status");
CREATE INDEX IF NOT EXISTS "goals_type_idx" ON "goals"("type");
CREATE INDEX IF NOT EXISTS "goals_target_date_idx" ON "goals"("targetDate");
CREATE INDEX IF NOT EXISTS "goals_deleted_at_idx" ON "goals"("deletedAt");

-- Índices para Budgets
CREATE INDEX IF NOT EXISTS "budgets_user_id_idx" ON "budgets"("userId");
CREATE INDEX IF NOT EXISTS "budgets_category_id_idx" ON "budgets"("categoryId");
CREATE INDEX IF NOT EXISTS "budgets_period_idx" ON "budgets"("period");
CREATE INDEX IF NOT EXISTS "budgets_deleted_at_idx" ON "budgets"("deletedAt");

-- Índices para Notifications
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_status_idx" ON "notifications"("status");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("createdAt");
CREATE INDEX IF NOT EXISTS "notifications_deleted_at_idx" ON "notifications"("deletedAt");

-- Índices para RecurringTransactions
CREATE INDEX IF NOT EXISTS "recurring_transactions_user_id_idx" ON "recurring_transactions"("userId");
CREATE INDEX IF NOT EXISTS "recurring_transactions_type_idx" ON "recurring_transactions"("type");
CREATE INDEX IF NOT EXISTS "recurring_transactions_frequency_idx" ON "recurring_transactions"("frequency");
CREATE INDEX IF NOT EXISTS "recurring_transactions_next_execution_idx" ON "recurring_transactions"("nextExecution");
CREATE INDEX IF NOT EXISTS "recurring_transactions_deleted_at_idx" ON "recurring_transactions"("deletedAt");

-- Índices para AuditLog
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_table_name_idx" ON "audit_logs"("tableName");
CREATE INDEX IF NOT EXISTS "audit_logs_record_id_idx" ON "audit_logs"("recordId");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("createdAt");

-- ========================================
-- FASE 8: ÍNDICES PARA SOFT DELETE
-- ========================================

-- Índices para soft delete em todas as tabelas
CREATE INDEX IF NOT EXISTS "account_banks_deleted_at_idx" ON "account_banks"("deletedAt");
CREATE INDEX IF NOT EXISTS "categories_deleted_at_idx" ON "categories"("deletedAt");
CREATE INDEX IF NOT EXISTS "transactions_deleted_at_idx" ON "transactions"("deletedAt");
CREATE INDEX IF NOT EXISTS "transfers_deleted_at_idx" ON "transfers"("deletedAt");
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deletedAt");

-- ========================================
-- FASE 9: DADOS INICIAIS (OPCIONAL)
-- ========================================

-- Inserir categorias padrão para novos usuários
-- (será implementado via seed script)

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se todas as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'goals', 'budgets', 'notifications', 
    'recurring_transactions', 'audit_logs'
);

-- Verificar se os índices foram criados
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE '%_idx';

-- ========================================
-- ROLLBACK (se necessário)
-- ========================================

/*
-- Para reverter as mudanças (descomente se necessário):

-- Remover índices
DROP INDEX IF EXISTS "account_banks_user_id_idx";
DROP INDEX IF EXISTS "categories_user_id_idx";
DROP INDEX IF EXISTS "transactions_user_id_idx";
-- ... (outros índices)

-- Remover tabelas
DROP TABLE IF EXISTS "audit_logs";
DROP TABLE IF EXISTS "recurring_transactions";
DROP TABLE IF EXISTS "notifications";
DROP TABLE IF EXISTS "budgets";
DROP TABLE IF EXISTS "goals";

-- Remover colunas
ALTER TABLE "account_banks" DROP COLUMN IF EXISTS "accountNumber";
ALTER TABLE "account_banks" DROP COLUMN IF EXISTS "agency";
ALTER TABLE "account_banks" DROP COLUMN IF EXISTS "isActive";
ALTER TABLE "account_banks" DROP COLUMN IF EXISTS "deletedAt";
-- ... (outras colunas)
*/ 