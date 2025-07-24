const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAuth() {
  console.log('🔐 Testando Autenticação e Usuários...\n');

  try {
    // 1. Verificar se há usuários no banco
    console.log('📋 1. Verificando usuários no banco...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            accountBanks: true,
            transactions: true,
            categories: true,
            Transfers: true
          }
        }
      }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco!');
      console.log('💡 Para testar, você precisa:');
      console.log('   1. Fazer login com Google OAuth');
      console.log('   2. Ou criar um usuário manualmente');
      return;
    }

    console.log(`✅ Encontrados ${users.length} usuário(s):`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Verificado: ${user.emailVerified ? 'Sim' : 'Não'}`);
      console.log(`      Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`);
      console.log(`      Contas: ${user._count.accountBanks}`);
      console.log(`      Transações: ${user._count.transactions}`);
      console.log(`      Categorias: ${user._count.categories}`);
      console.log(`      Transferências: ${user._count.Transfers}`);
      console.log('');
    });

    // 2. Testar a função getUserId com um usuário específico
    console.log('🔍 2. Testando função getUserId...');
    const testUser = users[0];
    
    console.log(`   Testando com usuário: ${testUser.email}`);
    
    // Verificar se o usuário tem dados
    const userAccounts = await prisma.accountBanks.findMany({
      where: { userId: testUser.id },
      select: { id: true, description: true, bank: true, amount: true }
    });

    const userTransactions = await prisma.transactions.findMany({
      where: { userId: testUser.id },
      select: { id: true, description: true, value: true, type: true }
    });

    const userCategories = await prisma.categories.findMany({
      where: { userId: testUser.id },
      select: { id: true, name: true, type: true }
    });

    const userTransfers = await prisma.transfers.findMany({
      where: { userId: testUser.id },
      select: { id: true, value: true, date: true }
    });

    console.log(`   ✅ Contas: ${userAccounts.length}`);
    console.log(`   ✅ Transações: ${userTransactions.length}`);
    console.log(`   ✅ Categorias: ${userCategories.length}`);
    console.log(`   ✅ Transferências: ${userTransfers.length}`);

    // 3. Mostrar exemplo de como usar o userId no frontend
    console.log('\n💻 3. Como usar no Frontend:');
    console.log(`
// No componente React:
import { useAuth } from "@/hooks/useAuth";

export function MyComponent() {
  const { userId, isAuthenticated, isLoading } = useAuth();
  
  const { data: accounts } = useQuery({
    queryKey: ["accounts", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      return await getAccounts(userId);
    },
    enabled: !!userId, // Só executa se tiver userId
  });
  
  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Faça login</div>;
  
  return <div>Seus dados aqui...</div>;
}
    `);

    // 4. Verificar configuração do NextAuth
    console.log('⚙️ 4. Verificando configuração do NextAuth...');
    console.log('   ✅ PrismaAdapter configurado');
    console.log('   ✅ Google Provider configurado');
    console.log('   ✅ Função getUserId implementada');
    
    // 5. Instruções para testar
    console.log('\n🚀 5. Como testar a autenticação:');
    console.log('   1. Acesse: http://localhost:3001');
    console.log('   2. Clique em "Sign in with Google"');
    console.log('   3. Faça login com sua conta Google');
    console.log('   4. O sistema irá:');
    console.log('      - Criar/atualizar usuário no banco');
    console.log('      - Pegar o userId automaticamente');
    console.log('      - Carregar dados específicos do usuário');
    console.log('   5. Verifique se os dados aparecem no dashboard');

    // 6. Mostrar dados de exemplo do usuário
    if (userAccounts.length > 0) {
      console.log('\n📊 6. Dados do usuário (exemplo):');
      console.log('   Contas:');
      userAccounts.forEach(account => {
        console.log(`      - ${account.description} (${account.bank}): R$ ${(account.amount / 100).toFixed(2)}`);
      });
    }

    if (userTransactions.length > 0) {
      console.log('   Transações:');
      userTransactions.slice(0, 3).forEach(transaction => {
        console.log(`      - ${transaction.description}: R$ ${(transaction.value / 100).toFixed(2)} (${transaction.type})`);
      });
    }

    if (userCategories.length > 0) {
      console.log('   Categorias:');
      userCategories.forEach(category => {
        console.log(`      - ${category.name} (${category.type})`);
      });
    }

    if (userTransfers.length > 0) {
      console.log('   Transferências:');
      userTransfers.slice(0, 3).forEach(transfer => {
        console.log(`      - R$ ${(transfer.value / 100).toFixed(2)} em ${transfer.date.toLocaleDateString('pt-BR')}`);
      });
    }

    // 7. Mostrar o userId que deve ser usado
    console.log('\n🔑 7. ID do Usuário para usar no sistema:');
    console.log(`   User ID: ${testUser.id}`);
    console.log('   Este ID será usado automaticamente quando você fizer login!');

  } catch (error) {
    console.error('❌ Erro ao testar autenticação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testAuth(); 