# Guia de Deploy na Vercel

Este guia explica como fazer o deploy do projeto AECAC na Vercel.

## Estrutura do Projeto

- **Frontend**: React + Vite (raiz do projeto)
- **Backend**: Next.js API Routes (pasta `api/`)

## Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ou MongoDB local
3. Git configurado

## Opção 1: Deploy Monorepo (Recomendado)

Esta opção faz deploy do frontend e backend juntos em um único projeto.

### Passo 1: Preparar o Repositório Git

```bash
# Se ainda não tiver um repositório Git
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repositorio-git>
git push -u origin main
```

### Passo 2: Criar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe seu repositório Git
4. Configure o projeto:
   - **Framework Preset**: Other
   - **Root Directory**: `/` (raiz)
   - **Build Command**: `npm run build && cd api && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install && cd api && npm install`

### Passo 3: Configurar Variáveis de Ambiente

Na Vercel, vá em **Settings > Environment Variables** e adicione:

#### Para o Backend (Next.js):
```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/aecac?retryWrites=true&w=majority
JWT_SECRET=sua-chave-secreta-jwt-super-segura-aqui
```

#### Para o Frontend (Vite):
```
VITE_API_URL=https://seu-projeto.vercel.app/api
```

**Importante**: 
- Substitua `seu-projeto.vercel.app` pela URL real do seu projeto na Vercel
- Use uma chave JWT segura e aleatória
- A URL da API será algo como: `https://aecac.vercel.app/api`

### Passo 4: Ajustar Configuração do Build

Se o build automático não funcionar, você pode criar um script de build customizado:

Crie um arquivo `build.sh` na raiz:

```bash
#!/bin/bash
# Build do frontend
npm install
npm run build

# Build do backend
cd api
npm install
npm run build
cd ..
```

## Opção 2: Deploy Separado (Alternativa)

Se preferir, pode fazer deploy do frontend e backend em projetos separados.

### Deploy do Backend (Next.js)

1. Crie um novo projeto na Vercel
2. Configure:
   - **Root Directory**: `api`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
3. Adicione variáveis de ambiente:
   - `MONGODB_URI`
   - `JWT_SECRET`

### Deploy do Frontend (Vite)

1. Crie outro projeto na Vercel
2. Configure:
   - **Root Directory**: `/` (raiz)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Adicione variável de ambiente:
   - `VITE_API_URL` (URL do backend deployado)

## Configuração do MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Configure Network Access:
   - Adicione `0.0.0.0/0` para permitir acesso de qualquer IP (ou apenas IPs da Vercel)
4. Crie um usuário de banco de dados
5. Copie a connection string e use como `MONGODB_URI`

## Criar Usuário Admin

Após o deploy, você precisará criar um usuário admin. Você pode:

1. **Opção A**: Executar o script localmente apontando para o MongoDB de produção
   ```bash
   cd api
   MONGODB_URI="sua-uri-de-producao" JWT_SECRET="seu-secret" node scripts/createAdmin.mjs
   ```

2. **Opção B**: Criar via API (após criar o primeiro usuário manualmente no MongoDB)

## Verificações Pós-Deploy

1. ✅ Verifique se o frontend está acessível
2. ✅ Verifique se a API está respondendo em `/api/eventos` (deve retornar array vazio)
3. ✅ Teste o login no admin
4. ✅ Verifique se as imagens estão sendo salvas corretamente

## Troubleshooting

### Erro: "Module not found"
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente para verificar

### Erro: "MongoDB connection failed"
- Verifique se o `MONGODB_URI` está correto
- Verifique se o IP da Vercel está permitido no MongoDB Atlas

### Erro: "CORS policy"
- Verifique se o `VITE_API_URL` no frontend aponta para a URL correta do backend
- Verifique os headers CORS no `next.config.js`

### Build falha
- Verifique os logs de build na Vercel
- Teste o build localmente: `npm run build`

## URLs de Produção

Após o deploy, você terá URLs como:
- Frontend: `https://aecac.vercel.app`
- API: `https://aecac.vercel.app/api`

## Atualizações Futuras

Para atualizar o projeto:
1. Faça as alterações no código
2. Commit e push para o Git
3. A Vercel fará deploy automático

## Suporte

Se encontrar problemas, verifique:
- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Vite](https://vitejs.dev)

