-- Migration: Adicionar campos de Soft Delete
-- Data: 2024-12-19
-- Descrição: Adiciona campos deletedAt para implementar soft delete nas tabelas principais

-- Adicionar campo deletedAt na tabela transactions
ALTER TABLE "transactions" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Adicionar campo deletedAt na tabela categories
ALTER TABLE "categories" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Adicionar campo deletedAt na tabela account_banks
ALTER TABLE "account_banks" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Adicionar campo deletedAt na tabela transfers
ALTER TABLE "transfers" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Criar índices para otimizar queries que filtram por deletedAt
CREATE INDEX "transactions_deletedAt_idx" ON "transactions"("deletedAt");
CREATE INDEX "categories_deletedAt_idx" ON "categories"("deletedAt");
CREATE INDEX "account_banks_deletedAt_idx" ON "account_banks"("deletedAt");
CREATE INDEX "transfers_deletedAt_idx" ON "transfers"("deletedAt");

-- Criar índices compostos para queries comuns
CREATE INDEX "transactions_userId_deletedAt_idx" ON "transactions"("userId", "deletedAt");
CREATE INDEX "categories_userId_deletedAt_idx" ON "categories"("userId", "deletedAt");
CREATE INDEX "account_banks_userId_deletedAt_idx" ON "account_banks"("userId", "deletedAt");
CREATE INDEX "transfers_userId_deletedAt_idx" ON "transfers"("userId", "deletedAt"); 