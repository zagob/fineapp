# 🧪 **Guia Completo de Teste - Sistema de Soft Delete**

## 🚀 **Servidor Iniciado**
- **URL**: http://localhost:3001 (ou porta disponível)
- **Status**: ✅ Rodando com Turbopack

---

## 📋 **Checklist de Testes**

### **1. 🔐 Autenticação**
- [ ] Acessar http://localhost:3001
- [ ] Fazer login com Google
- [ ] Verificar se está logado

### **2. 💳 Teste de Contas Bancárias**

#### **2.1 Criar Contas**
- [ ] Ir para `/accounts`
- [ ] Clicar em "Nova Conta"
- [ ] Criar conta "Banco Teste" com valor R$ 1000
- [ ] Verificar se aparece na lista

#### **2.2 Soft Delete de Conta**
- [ ] Encontrar botão de deletar na conta criada
- [ ] Clicar em deletar
- [ ] Confirmar "Mover para a lixeira?"
- [ ] Verificar se conta desaparece da lista principal

#### **2.3 Acessar Lixeira de Contas**
- [ ] Clicar no botão "Lixeira" na página de contas
- [ ] Verificar se conta deletada aparece na lixeira
- [ ] Verificar informações: nome, banco, data de deleção

#### **2.4 Restaurar Conta**
- [ ] Na lixeira, clicar em "Restaurar"
- [ ] Verificar se conta volta para lista principal
- [ ] Verificar se dados estão intactos

#### **2.5 Hard Delete de Conta**
- [ ] Deletar conta novamente (soft delete)
- [ ] Na lixeira, clicar em "Deletar"
- [ ] Confirmar exclusão permanente
- [ ] Verificar se conta não aparece mais na lixeira

### **3. 📊 Teste de Transações**

#### **3.1 Criar Transação**
- [ ] Ir para `/transactions`
- [ ] Criar transação de teste
- [ ] Verificar se aparece na lista

#### **3.2 Soft Delete de Transação**
- [ ] Encontrar botão de deletar na transação
- [ ] Clicar em deletar
- [ ] Confirmar "Mover para a lixeira?"
- [ ] Verificar se transação desaparece da lista

#### **3.3 Acessar Lixeira de Transações**
- [ ] Clicar no botão "Lixeira" na página de transações
- [ ] Verificar se transação deletada aparece
- [ ] Verificar informações: valor, categoria, data

#### **3.4 Restaurar Transação**
- [ ] Na lixeira, clicar em "Restaurar"
- [ ] Verificar se transação volta para lista principal

#### **3.5 Hard Delete de Transação**
- [ ] Deletar transação novamente
- [ ] Na lixeira, clicar em "Deletar"
- [ ] Confirmar exclusão permanente

### **4. 🏷️ Teste de Categorias**

#### **4.1 Categorias de Entrada**
- [ ] Ir para página de categorias
- [ ] Criar categoria de entrada "Teste Entrada"
- [ ] Deletar categoria (soft delete)
- [ ] Acessar lixeira de categorias de entrada
- [ ] Restaurar categoria
- [ ] Hard delete categoria

#### **4.2 Categorias de Saída**
- [ ] Criar categoria de saída "Teste Saída"
- [ ] Deletar categoria (soft delete)
- [ ] Acessar lixeira de categorias de saída
- [ ] Restaurar categoria
- [ ] Hard delete categoria

### **5. 🧭 Teste de Navegação**

#### **5.1 Menu Principal**
- [ ] Verificar se botão "Lixeira" aparece no menu
- [ ] Clicar em "Lixeira" no menu
- [ ] Verificar se redireciona para página de administração

#### **5.2 Páginas Principais**
- [ ] Verificar se todas as páginas carregam sem erro
- [ ] Verificar se botões de lixeira aparecem em cada página
- [ ] Testar navegação entre páginas

### **6. 🔄 Teste de Validações**

#### **6.1 Tentar Deletar Conta com Transações**
- [ ] Criar transação usando uma conta
- [ ] Tentar hard delete da conta
- [ ] Verificar se aparece erro de proteção
- [ ] Verificar mensagem de erro

#### **6.2 Tentar Restaurar Categoria Duplicada**
- [ ] Criar categoria "Teste"
- [ ] Deletar categoria (soft delete)
- [ ] Criar nova categoria com mesmo nome "Teste"
- [ ] Tentar restaurar categoria deletada
- [ ] Verificar se aparece erro de duplicata

### **7. ⚡ Teste de Performance**

#### **7.1 Cache e React Query**
- [ ] Deletar item
- [ ] Verificar se lista atualiza automaticamente
- [ ] Restaurar item
- [ ] Verificar se lista atualiza automaticamente
- [ ] Navegar entre páginas
- [ ] Verificar se dados persistem

#### **7.2 Múltiplas Operações**
- [ ] Deletar vários itens rapidamente
- [ ] Restaurar vários itens rapidamente
- [ ] Verificar se não há conflitos

---

## 🎯 **Critérios de Sucesso**

### **✅ Funcionalidades Básicas**
- [ ] Soft delete funciona em todas as entidades
- [ ] Lixeira mostra itens deletados
- [ ] Restauração funciona corretamente
- [ ] Hard delete funciona com confirmação

### **✅ Interface**
- [ ] Botões de lixeira aparecem em todas as páginas
- [ ] Diálogos de confirmação funcionam
- [ ] Mensagens de erro são claras
- [ ] Loading states funcionam

### **✅ Validações**
- [ ] Proteção contra deletar dados em uso
- [ ] Verificação de duplicatas ao restaurar
- [ ] Mensagens de erro informativas

### **✅ Performance**
- [ ] Operações são rápidas
- [ ] Cache funciona corretamente
- [ ] Não há erros de console

---

## 🐛 **Possíveis Problemas e Soluções**

### **Problema: Erro de Prisma**
```bash
# Solução: Verificar se banco está rodando
docker-compose up -d
```

### **Problema: Erro de Autenticação**
```bash
# Solução: Verificar variáveis de ambiente
cp env.example .env.local
# Configurar GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET
```

### **Problema: Erro de Compilação**
```bash
# Solução: Limpar cache
rm -rf .next
npm run dev
```

---

## 📝 **Relatório de Teste**

Após completar todos os testes, documente:

### **✅ Funcionalidades que Funcionam**
- Listar aqui...

### **❌ Problemas Encontrados**
- Listar aqui...

### **🔧 Melhorias Sugeridas**
- Listar aqui...

---

## 🎉 **Sistema Pronto para Produção!**

Se todos os testes passarem, o sistema está **100% funcional** e pronto para uso em produção! 🚀 