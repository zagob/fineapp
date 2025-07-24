-- ========================================
-- MIGRAÇÃO: ÍNDICES DE PERFORMANCE
-- ========================================
-- Data: 2024-12-19
-- Descrição: Adiciona índices estratégicos para melhorar performance das queries

-- ========================================
-- ÍNDICES PARA ACCOUNT_BANKS
-- ========================================

-- Índice para queries por usuário (muito usado)
CREATE INDEX IF NOT EXISTS "account_banks_user_id_idx" 
ON "account_banks"("userId");

-- Índice para filtros por banco
CREATE INDEX IF NOT EXISTS "account_banks_bank_idx" 
ON "account_banks"("bank");

-- ========================================
-- ÍNDICES PARA CATEGORIES
-- ========================================

-- Índice para queries por usuário
CREATE INDEX IF NOT EXISTS "categories_user_id_idx" 
ON "categories"("userId");

-- Índice para filtros por tipo (INCOME/EXPENSE)
CREATE INDEX IF NOT EXISTS "categories_type_idx" 
ON "categories"("type");

-- ========================================
-- ÍNDICES PARA TRANSACTIONS
-- ========================================

-- Índice para queries por usuário (CRÍTICO)
CREATE INDEX IF NOT EXISTS "transactions_user_id_idx" 
ON "transactions"("userId");

-- Índice para filtros por data (CRÍTICO)
CREATE INDEX IF NOT EXISTS "transactions_date_idx" 
ON "transactions"("date");

-- Índice para filtros por tipo
CREATE INDEX IF NOT EXISTS "transactions_type_idx" 
ON "transactions"("type");

-- Índice para joins com categorias
CREATE INDEX IF NOT EXISTS "transactions_category_id_idx" 
ON "transactions"("categoryId");

-- Índice para joins com bancos
CREATE INDEX IF NOT EXISTS "transactions_account_banks_id_idx" 
ON "transactions"("accountBanksId");

-- Índice composto para queries mais comuns
CREATE INDEX IF NOT EXISTS "transactions_user_date_idx" 
ON "transactions"("userId", "date");

-- Índice composto para relatórios
CREATE INDEX IF NOT EXISTS "transactions_user_type_date_idx" 
ON "transactions"("userId", "type", "date");

-- ========================================
-- ÍNDICES PARA TRANSFERS
-- ========================================

-- Índice para queries por usuário
CREATE INDEX IF NOT EXISTS "transfers_user_id_idx" 
ON "transfers"("userId");

-- Índice para filtros por data
CREATE INDEX IF NOT EXISTS "transfers_date_idx" 
ON "transfers"("date");

-- Índice para joins com bancos
CREATE INDEX IF NOT EXISTS "transfers_bank_initial_id_idx" 
ON "transfers"("bankInitialId");

CREATE INDEX IF NOT EXISTS "transfers_bank_destine_id_idx" 
ON "transfers"("bankDestineId");

-- ========================================
-- ÍNDICES PARA USERS
-- ========================================

-- Índice para login por email
CREATE INDEX IF NOT EXISTS "users_email_idx" 
ON "users"("email"); 