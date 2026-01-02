# Deploy do Frontend AECAC na Vercel

## 📋 Pré-requisitos

1. Conta no Vercel
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. API já deployada (projeto `api-aecac`)

## 🚀 Passo a Passo

### 1. Conectar o Repositório ao Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe o repositório `fn-aecac`
4. O Vercel detectará automaticamente que é um projeto Vite/React

### 2. Configurar Variáveis de Ambiente

No painel do projeto no Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione a seguinte variável:

```
VITE_API_URL=https://api-aecac-xxx.vercel.app/api
```

**Importante:**
- Substitua `api-aecac-xxx.vercel.app` pela URL real da sua API
- A URL deve terminar com `/api` (ex: `https://sua-api.vercel.app/api`)

### 3. Configurações do Projeto

O Vercel deve detectar automaticamente:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Se não detectar automaticamente, configure manualmente:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Após o deploy, você receberá uma URL como: `https://aecac.vercel.app`

### 5. Verificar CORS na API

Certifique-se de que a API está configurada para aceitar requisições do domínio do frontend. A API já está configurada para aceitar requisições de qualquer origem (`Access-Control-Allow-Origin: *`), então deve funcionar automaticamente.

## ✅ Verificação

Após o deploy, teste se o frontend está funcionando:

1. Acesse a URL do deploy
2. Verifique se as páginas carregam corretamente
3. Teste o login no painel admin: `/admin/login`

## 📝 Notas

- O frontend é uma SPA (Single Page Application) e todas as rotas devem redirecionar para `index.html`
- O `vercel.json` já está configurado corretamente
- Certifique-se de que a variável `VITE_API_URL` está configurada corretamente
- O frontend usa Vercel Analytics para tracking (já configurado)
