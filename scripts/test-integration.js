#!/usr/bin/env node

/**
 * Script para testar a integração completa do dashboard com o banco de dados
 * Execute com: node scripts/test-integration.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testIntegration() {
  try {
    log('🧪 Iniciando testes de integração do Dashboard...', 'bold');
    log('='.repeat(60), 'blue');

    // 1. Verificar conexão com banco
    log('\n📊 1. Testando conexão com banco de dados...', 'blue');
    await prisma.$connect();
    log('✅ Conexão com banco estabelecida', 'green');

    // 2. Verificar dados existentes
    log('\n📋 2. Verificando dados existentes...', 'blue');
    
    const user = await prisma.user.findFirst();
    if (!user) {
      log('❌ Nenhum usuário encontrado', 'red');
      return;
    }
    log(`✅ Usuário encontrado: ${user.name}`, 'green');

    const accounts = await prisma.accountBanks.findMany({
      where: { userId: user.id, deletedAt: null }
    });
    log(`✅ ${accounts.length} contas bancárias ativas`, 'green');

    const categories = await prisma.categories.findMany({
      where: { userId: user.id, deletedAt: null }
    });
    log(`✅ ${categories.length} categorias ativas`, 'green');

    const transactions = await prisma.transactions.findMany({
      where: { userId: user.id, deletedAt: null }
    });
    log(`✅ ${transactions.length} transações ativas`, 'green');

    const transfers = await prisma.transfers.findMany({
      where: { userId: user.id, deletedAt: null }
    });
    log(`✅ ${transfers.length} transferências ativas`, 'green');

    // 3. Calcular estatísticas
    log('\n📈 3. Calculando estatísticas...', 'blue');
    
    const totalBalance = accounts.reduce((sum, account) => sum + account.amount, 0);
    log(`💰 Saldo total: R$ ${(totalBalance / 100).toFixed(2)}`, 'green');

    const incomeTransactions = transactions.filter(t => t.type === 'INCOME');
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.value, 0);
    
    log(`📈 Receitas totais: R$ ${(totalIncome / 100).toFixed(2)}`, 'green');
    log(`📉 Despesas totais: R$ ${(totalExpenses / 100).toFixed(2)}`, 'green');
    log(`💵 Saldo líquido: R$ ${((totalIncome - totalExpenses) / 100).toFixed(2)}`, 'green');

    // 4. Verificar dados por categoria
    log('\n🏷️ 4. Verificando dados por categoria...', 'blue');
    
    const categoryStats = {};
    transactions.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      if (category) {
        if (!categoryStats[category.name]) {
          categoryStats[category.name] = { income: 0, expense: 0, count: 0 };
        }
        if (transaction.type === 'INCOME') {
          categoryStats[category.name].income += transaction.value;
        } else {
          categoryStats[category.name].expense += transaction.value;
        }
        categoryStats[category.name].count++;
      }
    });

    Object.entries(categoryStats).forEach(([categoryName, stats]) => {
      log(`   ${categoryName}: ${stats.count} transações`, 'yellow');
      if (stats.income > 0) {
        log(`     📈 Receitas: R$ ${(stats.income / 100).toFixed(2)}`, 'green');
      }
      if (stats.expense > 0) {
        log(`     📉 Despesas: R$ ${(stats.expense / 100).toFixed(2)}`, 'red');
      }
    });

    // 5. Verificar dados por conta bancária
    log('\n💳 5. Verificando dados por conta bancária...', 'blue');
    
    accounts.forEach(account => {
      const accountTransactions = transactions.filter(t => t.accountBanksId === account.id);
      const accountIncome = accountTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.value, 0);
      const accountExpenses = accountTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.value, 0);
      
      log(`   ${account.description} (${account.bank}):`, 'yellow');
      log(`     💰 Saldo: R$ ${(account.amount / 100).toFixed(2)}`, 'green');
      log(`     📈 Receitas: R$ ${(accountIncome / 100).toFixed(2)}`, 'green');
      log(`     📉 Despesas: R$ ${(accountExpenses / 100).toFixed(2)}`, 'red');
      log(`     🔢 Transações: ${accountTransactions.length}`, 'blue');
    });

    // 6. Verificar dados de soft delete
    log('\n🗑️ 6. Verificando dados de soft delete...', 'blue');
    
    const deletedAccounts = await prisma.accountBanks.findMany({
      where: { userId: user.id, deletedAt: { not: null } }
    });
    log(`   Contas deletadas: ${deletedAccounts.length}`, 'yellow');

    const deletedCategories = await prisma.categories.findMany({
      where: { userId: user.id, deletedAt: { not: null } }
    });
    log(`   Categorias deletadas: ${deletedCategories.length}`, 'yellow');

    const deletedTransactions = await prisma.transactions.findMany({
      where: { userId: user.id, deletedAt: { not: null } }
    });
    log(`   Transações deletadas: ${deletedTransactions.length}`, 'yellow');

    // 7. Testar queries das actions
    log('\n🔧 7. Testando queries das actions...', 'blue');
    
    // Simular getAccounts
    const activeAccounts = await prisma.accountBanks.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { description: 'asc' }
    });
    log(`   ✅ getAccounts: ${activeAccounts.length} contas retornadas`, 'green');

    // Simular getTransactions
    const activeTransactions = await prisma.transactions.findMany({
      where: { userId: user.id, deletedAt: null },
      include: {
        bank: true,
        category: true
      },
      orderBy: { date: 'desc' }
    });
    log(`   ✅ getTransactions: ${activeTransactions.length} transações retornadas`, 'green');

    // Simular getCategories
    const activeCategories = await prisma.categories.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { name: 'asc' }
    });
    log(`   ✅ getCategories: ${activeCategories.length} categorias retornadas`, 'green');

    // 8. Resumo final
    log('\n📊 Resumo da Integração:', 'bold');
    log('='.repeat(40), 'blue');
    
    log(`👤 Usuário: ${user.name}`, 'green');
    log(`💳 Contas ativas: ${accounts.length}`, 'green');
    log(`🏷️ Categorias ativas: ${categories.length}`, 'green');
    log(`💰 Transações ativas: ${transactions.length}`, 'green');
    log(`🔄 Transferências ativas: ${transfers.length}`, 'green');
    log(`💵 Saldo total: R$ ${(totalBalance / 100).toFixed(2)}`, 'green');
    log(`📈 Receitas: R$ ${(totalIncome / 100).toFixed(2)}`, 'green');
    log(`📉 Despesas: R$ ${(totalExpenses / 100).toFixed(2)}`, 'green');
    log(`🗑️ Itens deletados: ${deletedAccounts.length + deletedCategories.length + deletedTransactions.length}`, 'yellow');

    log('\n🎉 Teste de integração concluído com sucesso!', 'green');
    log('💡 O dashboard está pronto para ser usado com dados reais:', 'blue');
    log('   http://localhost:3001', 'yellow');

  } catch (error) {
    log(`\n💥 Erro durante teste de integração: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testIntegration(); 