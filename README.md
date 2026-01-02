# AECAC - Associação Empresarial e Comercial de Águas Claras

Site institucional da AECAC desenvolvido em React com Ant Design e backend Next.js com MongoDB.

## 🚀 Tecnologias

### Frontend
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool moderna e rápida
- **Ant Design** - Biblioteca de componentes UI
- **React Router** - Roteamento para aplicações React
- **Axios** - Cliente HTTP
- **Day.js** - Manipulação de datas

### Backend
- **Next.js** - Framework React com API Routes
- **MongoDB** - Banco de dados NoSQL
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas

## 📦 Instalação

### Frontend

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

### Backend

```bash
cd api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais MongoDB e JWT_SECRET

# Iniciar servidor de desenvolvimento
npm run dev
```

## 📁 Estrutura do Projeto

```
.
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/              # Páginas da aplicação
│   │   ├── Admin/          # Painel administrativo
│   ├── lib/                # Utilitários e API client
│   └── App.jsx            # Componente principal
├── api/                    # Backend Next.js
│   ├── pages/api/         # API Routes
│   ├── lib/               # Utilitários (MongoDB, Auth)
│   └── middleware/        # Middlewares
└── README.md
```

## 🎨 Páginas

### Públicas
- **Home**: Página inicial com hero section, estatísticas, missão/visão e benefícios
- **Sobre**: Informações sobre a associação, história, valores e objetivos
- **Galeria**: Galeria de imagens dos eventos e atividades
- **Parceiros**: Lista de parceiros estratégicos com benefícios
- **Empresas**: Diretório de empresas associadas com busca e filtros
- **Eventos**: Lista de eventos com visualização em lista e calendário

### Administrativas
- **Login**: Autenticação de administradores
- **Dashboard**: Visão geral com estatísticas
- **Gerenciamento**: CRUD completo para:
  - Eventos
  - Parceiros
  - Empresas
  - Galeria
  - Diretoria
  - Sobre

## 🔐 Autenticação

O painel administrativo requer autenticação. Para criar o primeiro usuário:

1. Acesse o MongoDB e crie um documento na coleção `users`:
```json
{
  "email": "admin@aecac.org.br",
  "password": "<hash_bcrypt>",
  "name": "Administrador"
}
```

Ou use o endpoint `/api/auth/register` (requer autenticação de outro admin).

## 🌐 Deploy

### Frontend
O frontend pode ser hospedado em qualquer serviço de hospedagem estática (Vercel, Netlify, etc.).

Configure a variável de ambiente:
- `REACT_APP_API_URL`: URL da API backend

### Backend
O backend está configurado para deploy na Vercel:

1. Conecte o repositório à Vercel
2. Configure as variáveis de ambiente:
   - `MONGODB_URI`: URI de conexão do MongoDB
   - `JWT_SECRET`: Chave secreta para JWT
3. O deploy será automático

## 📝 Variáveis de Ambiente

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

**Nota:** No Vite, as variáveis de ambiente devem ter o prefixo `VITE_` para serem expostas ao cliente.

### Backend (api/.env.local)
```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/aecac
JWT_SECRET=sua-chave-secreta-super-segura
```

## 🔧 Desenvolvimento

1. Inicie o backend:
```bash
cd api
npm run dev
```

2. Inicie o frontend:
```bash
npm run dev
```

3. Acesse:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Admin: http://localhost:5173/admin

## 📱 Responsividade

O site é totalmente responsivo e se adapta a diferentes tamanhos de tela.

## 🔄 Próximos Passos

- [ ] Integração com upload de imagens (Cloudinary, AWS S3)
- [ ] Sistema de inscrição em eventos
- [ ] Newsletter
- [ ] Área de membros
- [ ] Pagamentos online
- [ ] Testes automatizados
