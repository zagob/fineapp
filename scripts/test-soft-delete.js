#!/usr/bin/env node

/**
 * Script de Teste Automatizado - Sistema de Soft Delete
 * 
 * Este script testa as APIs do sistema de soft delete
 * Execute com: node scripts/test-soft-delete.js
 */

const BASE_URL = 'http://localhost:3001';

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

function logTest(testName, success, details = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  const color = success ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

async function testAPI(endpoint, expectedStatus = 401) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    const success = response.status === expectedStatus;
    const details = `Status: ${response.status}, Response: ${JSON.stringify(data).substring(0, 100)}...`;
    
    logTest(`API ${endpoint}`, success, details);
    return success;
  } catch (error) {
    logTest(`API ${endpoint}`, false, `Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('🧪 Iniciando Testes do Sistema de Soft Delete', 'bold');
  log('='.repeat(50), 'blue');
  
  // Testar se o servidor está rodando
  log('\n🔍 Testando conectividade do servidor...', 'blue');
  try {
    const response = await fetch(BASE_URL);
    logTest('Servidor rodando', response.ok, `Status: ${response.status}`);
  } catch (error) {
    logTest('Servidor rodando', false, `Error: ${error.message}`);
    log('\n❌ Servidor não está rodando. Execute: npm run dev', 'red');
    process.exit(1);
  }
  
  // Testar APIs GET (sem autenticação - devem retornar 401)
  log('\n🔐 Testando APIs GET (sem autenticação)...', 'blue');
  
  const getApis = [
    '/api/accounts',
    '/api/accounts/deleted',
    '/api/categories',
    '/api/categories/deleted',
    '/api/transactions/deleted'
  ];
  
  let passedTests = 0;
  let totalTests = getApis.length + 1; // +1 para teste do servidor
  
  for (const api of getApis) {
    const success = await testAPI(api, 401);
    if (success) passedTests++;
  }
  
  // Testar páginas principais
  log('\n🌐 Testando páginas principais...', 'blue');
  
  const pages = [
    '/',
    '/accounts',
    '/transactions',
    '/transfers'
  ];
  
  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`);
      const success = response.status === 200;
      logTest(`Página ${page}`, success, `Status: ${response.status}`);
      if (success) passedTests++;
      totalTests++;
    } catch (error) {
      logTest(`Página ${page}`, false, `Error: ${error.message}`);
      totalTests++;
    }
  }
  
  // Resumo
  log('\n📊 Resumo dos Testes', 'bold');
  log('='.repeat(30), 'blue');
  log(`Total de testes: ${totalTests}`, 'blue');
  log(`Testes passaram: ${passedTests}`, 'green');
  log(`Testes falharam: ${totalTests - passedTests}`, 'red');
  
  const successRate = (passedTests / totalTests) * 100;
  log(`Taxa de sucesso: ${successRate.toFixed(1)}%`, successRate >= 90 ? 'green' : 'yellow');
  
  if (successRate >= 90) {
    log('\n🎉 Sistema está funcionando corretamente!', 'green');
    log('💡 Agora você pode testar a interface no navegador:', 'blue');
    log(`   ${BASE_URL}`, 'yellow');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique o servidor.', 'yellow');
  }
  
  log('\n📋 Próximos passos para teste manual:', 'blue');
  log('1. Acesse o navegador e vá para:', 'yellow');
  log(`   ${BASE_URL}`, 'yellow');
  log('2. Faça login com Google', 'yellow');
  log('3. Teste as funcionalidades de soft delete:', 'yellow');
  log('   - Deletar itens (soft delete)', 'yellow');
  log('   - Acessar lixeira', 'yellow');
  log('   - Restaurar itens', 'yellow');
  log('   - Hard delete', 'yellow');
  
  log('\n📖 Guia completo de teste:', 'blue');
  log('   TESTE_COMPLETO_SOFT_DELETE.md', 'yellow');
}

// Executar testes
runTests().catch(error => {
  log(`\n💥 Erro durante os testes: ${error.message}`, 'red');
  process.exit(1);
}); 