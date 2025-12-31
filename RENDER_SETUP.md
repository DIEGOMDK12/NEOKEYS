# 🚀 Guia de Migração para Render

Este guia vai te ajudar a fazer deploy do seu projeto ELITEVAULT no Render.

## ✅ Passo 1: Enviar código para GitHub

1. Se você ainda não tem um repositório GitHub:
   - Acesse https://github.com/new
   - Crie um novo repositório chamado `elitevault`
   - **Não** initialize com README/gitignore/license

2. Abra o terminal e execute:
```bash
git init
git add .
git commit -m "Initial commit - ELITEVAULT project"
git remote add origin https://github.com/SEU_USUARIO/elitevault.git
git branch -M main
git push -u origin main
```

## 📦 Passo 2: Criar Banco de Dados no Render

1. Acesse https://dashboard.render.com (crie conta se necessário)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `elitevault-db`
   - **Region**: Escolha a mais próxima (ex: **São Paulo** se disponível, ou **Virginia**)
   - **PostgreSQL Version**: deixe padrão
   - **Instance Type**: **Free**
4. Clique **"Create Database"**
5. Aguarde 2-3 minutos para provisionar
6. Quando pronto, **copie a URL interna** (Internal Database URL)
   - Vai parecer com: `postgresql://user:password@host:5432/database`

## 🌐 Passo 3: Deploy da Aplicação

1. Na mesma conta Render, clique **"New +"** → **"Web Service"**
2. Clique **"Build and deploy from a Git repository"**
3. Clique **"Connect account"** e autorize o Render acessar seu GitHub
4. Selecione o repositório `elitevault`
5. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `elitevault-app` |
| **Region** | **Mesma do banco de dados** (importante!) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

6. Clique em **"Advanced"** e adicione variáveis de ambiente:

| Chave | Valor |
|-------|-------|
| `DATABASE_URL` | **Cole a URL de conexão do Neon** (exemplo: `postgresql://user:pass@host/neondb?sslmode=require&channel_binding=require`) |
| `NODE_ENV` | `production` |

**⚠️ IMPORTANTE**: A DATABASE_URL é gerenciada pelo Replit em desenvolvimento. Para usar uma conexão Neon customizada em desenvolvimento local, crie um arquivo `.env.local` na raiz do projeto com:
```
DATABASE_URL=sua_string_neon_aqui
```

7. Clique **"Create Web Service"**
8. Render vai compilar e fazer deploy automaticamente

## ✨ Passo 4: Configurar Banco de Dados

Quando o deploy ficar verde (sucessful), seu site estará ONLINE!

O banco de dados já virá vazio. Se você tiver dados importantes, você precisará:
- Fazer backup dos dados atuais
- Rodar migrações: `npm run db:push`

## 🔗 Acessar sua aplicação

Seu app estará em: `https://elitevault-app.onrender.com`

**Compartilhe este link no WhatsApp!** O logo agora vai aparecer corretamente.

## 🔄 Auto-Deploy (automático)

Sempre que você fizer `git push` para main, Render vai:
1. Detectar a mudança
2. Recompilar a aplicação
3. Fazer deploy automaticamente

## ⚠️ Nota importante sobre o plano Free

- A aplicação dorme após 15 minutos sem requisições
- Primeira requisição depois pode levar até 30 segundos
- Banco de dados expira em 90 dias (sem upgrade)

## 🆘 Troubleshooting

**Se o deploy falhar:**
- Verifique o Build Log no painel do Render
- Confirme que a DATABASE_URL está correta
- Certifique-se de que as regiões do banco e app são as mesmas

**Se não conseguir acessar:**
- Aguarde 2-3 minutos após deploy
- Limpe cache do navegador
- Verifique se a URL está correta no painel Render

---

**Precisa de ajuda?** Siga os passos acima na ordem! 🚀
