#!/usr/bin/env node

/**
 * Script para popular o banco de dados com dados de exemplo
 * Execute com: node scripts/seed-database.js
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

async function seedDatabase() {
  try {
    log('🌱 Iniciando população do banco de dados...', 'bold');
    log('='.repeat(50), 'blue');

    // Verificar se já existe um usuário
    let user = await prisma.user.findFirst();
    
    if (!user) {
      log('👤 Criando usuário de exemplo...', 'blue');
      user = await prisma.user.create({
        data: {
          id: 'user_example_123',
          name: 'Usuário Exemplo',
          email: 'usuario@exemplo.com',
          emailVerified: new Date(),
          image: 'https://via.placeholder.com/150',
        }
      });
      log('✅ Usuário criado com sucesso!', 'green');
    } else {
      log('✅ Usuário já existe, usando existente', 'yellow');
    }

    // Criar contas bancárias de exemplo
    log('\n💳 Criando contas bancárias...', 'blue');
    
    const existingAccounts = await prisma.accountBanks.findMany({
      where: { userId: user.id }
    });

    if (existingAccounts.length === 0) {
      const accounts = [
        {
          bank: 'ITAU',
          description: 'Conta Corrente Itaú',
          amount: 42520,
          userId: user.id
        },
        {
          bank: 'NUBANK',
          description: 'Conta Nubank',
          amount: 14123,
          userId: user.id
        },
        {
          bank: 'PICPAY',
          description: 'Carteira PicPay',
          amount: 850,
          userId: user.id
        },
        {
          bank: 'BANCO_DO_BRASIL',
          description: 'Conta BB',
          amount: 2500,
          userId: user.id
        }
      ];

      for (const accountData of accounts) {
        await prisma.accountBanks.create({
          data: accountData
        });
      }
      log('✅ 4 contas bancárias criadas!', 'green');
    } else {
      log(`✅ ${existingAccounts.length} contas já existem`, 'yellow');
    }

    // Criar categorias de exemplo
    log('\n🏷️ Criando categorias...', 'blue');
    
    const existingCategories = await prisma.categories.findMany({
      where: { userId: user.id }
    });

    if (existingCategories.length === 0) {
      const categories = [
        // Categorias de ENTRADA
        {
          name: 'Salário',
          type: 'INCOME',
          color: '#10B981',
          icon: '💼',
          userId: user.id
        },
        {
          name: 'Freelance',
          type: 'INCOME',
          color: '#3B82F6',
          icon: '💻',
          userId: user.id
        },
        {
          name: 'Investimentos',
          type: 'INCOME',
          color: '#F59E0B',
          icon: '📈',
          userId: user.id
        },
        {
          name: 'Presentes',
          type: 'INCOME',
          color: '#EC4899',
          icon: '🎁',
          userId: user.id
        },

        // Categorias de SAÍDA
        {
          name: 'Alimentação',
          type: 'EXPENSE',
          color: '#EF4444',
          icon: '🍕',
          userId: user.id
        },
        {
          name: 'Transporte',
          type: 'EXPENSE',
          color: '#8B5CF6',
          icon: '🚗',
          userId: user.id
        },
        {
          name: 'Moradia',
          type: 'EXPENSE',
          color: '#06B6D4',
          icon: '🏠',
          userId: user.id
        },
        {
          name: 'Lazer',
          type: 'EXPENSE',
          color: '#F97316',
          icon: '🎮',
          userId: user.id
        },
        {
          name: 'Saúde',
          type: 'EXPENSE',
          color: '#84CC16',
          icon: '💊',
          userId: user.id
        },
        {
          name: 'Educação',
          type: 'EXPENSE',
          color: '#6366F1',
          icon: '📚',
          userId: user.id
        }
      ];

      for (const categoryData of categories) {
        await prisma.categories.create({
          data: categoryData
        });
      }
      log('✅ 10 categorias criadas!', 'green');
    } else {
      log(`✅ ${existingCategories.length} categorias já existem`, 'yellow');
    }

    // Buscar contas e categorias para criar transações
    const accounts = await prisma.accountBanks.findMany({
      where: { userId: user.id }
    });

    const categories = await prisma.categories.findMany({
      where: { userId: user.id }
    });

    // Criar transações de exemplo
    log('\n💰 Criando transações...', 'blue');
    
    const existingTransactions = await prisma.transactions.findMany({
      where: { userId: user.id }
    });

    if (existingTransactions.length === 0) {
      const transactions = [
        // Transações de ENTRADA
        {
          date: new Date('2025-07-15'),
          type: 'INCOME',
          accountBanksId: accounts[0].id, // Itaú
          categoryId: categories.find(c => c.name === 'Salário').id,
          description: 'Salário do mês',
          value: 500000, // R$ 5.000,00
          userId: user.id
        },
        {
          date: new Date('2025-07-10'),
          type: 'INCOME',
          accountBanksId: accounts[1].id, // Nubank
          categoryId: categories.find(c => c.name === 'Freelance').id,
          description: 'Projeto freelance',
          value: 150000, // R$ 1.500,00
          userId: user.id
        },
        {
          date: new Date('2025-07-05'),
          type: 'INCOME',
          accountBanksId: accounts[2].id, // PicPay
          categoryId: categories.find(c => c.name === 'Investimentos').id,
          description: 'Dividendos',
          value: 25000, // R$ 250,00
          userId: user.id
        },

        // Transações de SAÍDA
        {
          date: new Date('2025-07-18'),
          type: 'EXPENSE',
          accountBanksId: accounts[0].id, // Itaú
          categoryId: categories.find(c => c.name === 'Alimentação').id,
          description: 'Supermercado',
          value: 35000, // R$ 350,00
          userId: user.id
        },
        {
          date: new Date('2025-07-17'),
          type: 'EXPENSE',
          accountBanksId: accounts[1].id, // Nubank
          categoryId: categories.find(c => c.name === 'Transporte').id,
          description: 'Uber',
          value: 2500, // R$ 25,00
          userId: user.id
        },
        {
          date: new Date('2025-07-16'),
          type: 'EXPENSE',
          accountBanksId: accounts[0].id, // Itaú
          categoryId: categories.find(c => c.name === 'Moradia').id,
          description: 'Aluguel',
          value: 120000, // R$ 1.200,00
          userId: user.id
        },
        {
          date: new Date('2025-07-14'),
          type: 'EXPENSE',
          accountBanksId: accounts[2].id, // PicPay
          categoryId: categories.find(c => c.name === 'Lazer').id,
          description: 'Cinema',
          value: 4000, // R$ 40,00
          userId: user.id
        },
        {
          date: new Date('2025-07-12'),
          type: 'EXPENSE',
          accountBanksId: accounts[1].id, // Nubank
          categoryId: categories.find(c => c.name === 'Saúde').id,
          description: 'Farmácia',
          value: 8500, // R$ 85,00
          userId: user.id
        }
      ];

      for (const transactionData of transactions) {
        await prisma.transactions.create({
          data: transactionData
        });
      }
      log('✅ 8 transações criadas!', 'green');
    } else {
      log(`✅ ${existingTransactions.length} transações já existem`, 'yellow');
    }

    // Criar transferências de exemplo
    log('\n🔄 Criando transferências...', 'blue');
    
    const existingTransfers = await prisma.transfers.findMany({
      where: { userId: user.id }
    });

    if (existingTransfers.length === 0) {
      const transfers = [
        {
          date: new Date('2025-07-13'),
          bankInitialId: accounts[0].id, // Itaú
          bankDestineId: accounts[1].id, // Nubank
          value: 50000, // R$ 500,00
          userId: user.id
        },
        {
          date: new Date('2025-07-08'),
          bankInitialId: accounts[1].id, // Nubank
          bankDestineId: accounts[2].id, // PicPay
          value: 15000, // R$ 150,00
          userId: user.id
        }
      ];

      for (const transferData of transfers) {
        await prisma.transfers.create({
          data: transferData
        });
      }
      log('✅ 2 transferências criadas!', 'green');
    } else {
      log(`✅ ${existingTransfers.length} transferências já existem`, 'yellow');
    }

    // Resumo final
    log('\n📊 Resumo da população do banco:', 'bold');
    log('='.repeat(40), 'blue');
    
    const totalAccounts = await prisma.accountBanks.count({ where: { userId: user.id } });
    const totalCategories = await prisma.categories.count({ where: { userId: user.id } });
    const totalTransactions = await prisma.transactions.count({ where: { userId: user.id } });
    const totalTransfers = await prisma.transfers.count({ where: { userId: user.id } });

    log(`👤 Usuário: ${user.name}`, 'green');
    log(`💳 Contas bancárias: ${totalAccounts}`, 'green');
    log(`🏷️ Categorias: ${totalCategories}`, 'green');
    log(`💰 Transações: ${totalTransactions}`, 'green');
    log(`🔄 Transferências: ${totalTransfers}`, 'green');

    log('\n🎉 Banco de dados populado com sucesso!', 'green');
    log('💡 Agora você pode testar o dashboard com dados reais:', 'blue');
    log('   http://localhost:3001', 'yellow');

  } catch (error) {
    log(`\n💥 Erro ao popular banco: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
seedDatabase(); 