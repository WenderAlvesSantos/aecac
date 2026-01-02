# Instruções para Adicionar o Logo da AECAC

## 📍 Onde o Logo é Usado

O logo da AECAC está implementado nos seguintes locais:

1. **Header (Cabeçalho)** - Todas as páginas públicas
2. **Footer (Rodapé)** - Todas as páginas públicas  
3. **Página Home** - Hero section (seção principal)
4. **Painel Admin** - Dashboard e Login
5. **Favicon** - Ícone do navegador

## 📁 Como Adicionar a Imagem

1. Coloque o arquivo de imagem do logo em:
   ```
   /public/assets/logo-aecac.png
   ```

2. Formatos suportados:
   - PNG (recomendado)
   - JPG
   - SVG

3. Tamanho recomendado:
   - Mínimo: 200x200px
   - Ideal: 400x400px ou maior
   - Formato: PNG com fundo transparente (se possível)

## 🎨 Comportamento

- **Header**: Logo com altura de 50px
- **Footer**: Logo invertido (branco) com altura de 60px
- **Home**: Logo invertido (branco) com altura de 120px
- **Admin**: Logo invertido (branco) com altura de 40px
- **Login**: Logo normal com altura de 80px

Se a imagem não for encontrada, o sistema exibirá automaticamente o texto "AECAC" como fallback.

## ✅ Verificação

Após adicionar a imagem, verifique:
- [ ] Logo aparece no cabeçalho
- [ ] Logo aparece no rodapé (branco)
- [ ] Logo aparece na página inicial
- [ ] Logo aparece no painel admin
- [ ] Favicon aparece na aba do navegador

