# Guia Rápido de Deploy na Vercel

## Passo a Passo Simplificado

### 1. Preparar o Código

Certifique-se de que todos os arquivos estão commitados no Git:

```bash
git add .
git commit -m "Preparando para deploy"
git push
```

### 2. Criar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Conecte seu repositório Git (GitHub, GitLab ou Bitbucket)
4. Selecione o repositório do projeto AECAC

### 3. Configurar o Projeto

Na tela de configuração do projeto:

- **Framework Preset**: Deixe em branco ou selecione "Other"
- **Root Directory**: `/` (raiz)
- **Build Command**: `npm run build && cd api && npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install && cd api && npm install`

### 4. Configurar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

#### Backend (Next.js):
```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/aecac?retryWrites=true&w=majority
JWT_SECRET=uma-chave-secreta-muito-segura-aqui-mude-isso
```

#### Frontend (Vite):
```
VITE_API_URL=https://seu-projeto.vercel.app/api
```

**⚠️ IMPORTANTE**: 
- Após o primeiro deploy, a Vercel vai te dar uma URL (ex: `aecac-xyz.vercel.app`)
- Volte nas variáveis de ambiente e atualize `VITE_API_URL` com a URL real
- Faça um novo deploy após atualizar

### 5. Deploy

Clique em **"Deploy"** e aguarde o processo terminar.

### 6. Criar Usuário Admin

Após o deploy, você precisa criar o primeiro usuário admin:

```bash
cd api
MONGODB_URI="sua-uri-do-mongodb-atlas" JWT_SECRET="sua-chave-jwt" node scripts/createAdmin.mjs
```

Ou crie manualmente no MongoDB Atlas.

### 7. Testar

1. Acesse a URL fornecida pela Vercel
2. Teste o login em `/admin/login`
3. Verifique se as páginas estão carregando corretamente

## Configuração do MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um cluster (opção gratuita M0)
4. Configure Network Access:
   - Clique em "Network Access"
   - Adicione IP: `0.0.0.0/0` (permite de qualquer lugar)
5. Crie um usuário de banco de dados
6. Copie a connection string e use como `MONGODB_URI`

## Troubleshooting

### Build falha
- Verifique os logs na Vercel
- Teste localmente: `npm run build && cd api && npm run build`

### Erro de CORS
- Certifique-se que `VITE_API_URL` aponta para a URL correta
- A URL deve ser: `https://seu-projeto.vercel.app/api`

### MongoDB não conecta
- Verifique se o IP `0.0.0.0/0` está permitido no MongoDB Atlas
- Verifique se a connection string está correta

### Imagens não aparecem
- Verifique se o `bodyParser` está configurado no `next.config.js` (já está)
- Verifique os logs da API na Vercel

## Próximos Passos

Após o deploy bem-sucedido:
1. Configure um domínio personalizado (opcional)
2. Configure CI/CD automático (já funciona com Git)
3. Configure monitoramento e logs

## Suporte

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Vite](https://vitejs.dev)

