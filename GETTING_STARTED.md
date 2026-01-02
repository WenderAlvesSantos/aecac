# Guia de Início Rápido - AECAC

## 🚀 Configuração Inicial

### 1. Backend (API)

```bash
cd api
npm install
```

Crie o arquivo `.env.local` na pasta `api/`:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/aecac?retryWrites=true&w=majority
JWT_SECRET=sua-chave-secreta-super-segura-aqui-mude-em-producao
```

Inicie o servidor:
```bash
npm run dev
```

A API estará disponível em `http://localhost:3000/api`

### 2. Criar Primeiro Usuário Admin

Você pode criar o primeiro usuário admin de duas formas:

#### Opção 1: Via Script (Recomendado)

```bash
cd api
node scripts/createAdmin.mjs
```

O script criará um usuário admin com:
- **Email**: `admin@aecac.org.br`
- **Senha**: `admin123`

Você pode personalizar essas credenciais definindo variáveis de ambiente no arquivo `api/.env.local`:
```env
ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD=suasenha
ADMIN_NAME=Seu Nome
```

#### Opção 2: Via MongoDB

Acesse seu MongoDB e insira na coleção `users`:

```json
{
  "email": "admin@aecac.org.br",
  "password": "<hash_bcrypt_da_senha>",
  "name": "Administrador",
  "createdAt": new Date()
}
```

Para gerar o hash da senha, você pode usar:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('sua-senha-aqui', 10);
console.log(hash);
```

### 3. Frontend

```bash
# Na raiz do projeto
npm install
```

Crie o arquivo `.env` na raiz:

```env
VITE_API_URL=http://localhost:3000/api
```

**Nota:** No Vite, as variáveis de ambiente devem ter o prefixo `VITE_` para serem expostas ao cliente.

Inicie o servidor:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 📝 Acessos

- **Site público**: http://localhost:5173
- **Painel admin (login)**: http://localhost:5173/admin/login
- **Painel admin (dashboard)**: http://localhost:5173/admin
- **API**: http://localhost:3000/api

## 🔐 Login Admin

1. Acesse: **http://localhost:5173/admin/login**
2. Use as credenciais criadas no passo 2:
   - **Email**: `admin@aecac.org.br` (ou o que você configurou)
   - **Senha**: `admin123` (ou a que você configurou)

Após o login, você será redirecionado para o dashboard administrativo.

## 📦 Estrutura do Banco de Dados

O MongoDB criará automaticamente as seguintes coleções:

- `users` - Usuários administrativos
- `eventos` - Eventos da associação
- `parceiros` - Parceiros estratégicos
- `empresas` - Empresas associadas
- `galeria` - Imagens da galeria
- `diretoria` - Membros da diretoria
- `sobre` - Informações da página Sobre

## 🌐 Deploy

### Backend na Vercel

1. Conecte o repositório à Vercel
2. Configure as variáveis de ambiente:
   - `MONGODB_URI`
   - `JWT_SECRET`
3. Deploy automático

### Frontend

Configure a variável `REACT_APP_API_URL` apontando para a URL da API em produção.

## 🐛 Problemas Comuns

### Erro de conexão com MongoDB
- Verifique se a URI está correta
- Verifique se o IP está liberado no MongoDB Atlas (se usar Atlas)

### Erro 401 (Não autorizado)
- Verifique se o token está sendo enviado no header
- Verifique se o JWT_SECRET está configurado corretamente

### CORS Error
- O backend já está configurado para aceitar requisições de qualquer origem
- Verifique se a URL da API está correta no frontend

