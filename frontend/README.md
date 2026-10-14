# Frontend - Meus Livros (PWA)

HTML, CSS e JavaScript puros. Consome a API de livros.

## Executar localmente
Com o backend rodando na porta 3000:
```bash
npx serve .
```

## Endereço da API
Edite `config.js`. Após o deploy do backend no Render, troque por:
```js
const API_BASE_URL = "https://SEU-APP.onrender.com";
```

## Deploy no Netlify
Publish directory: a própria pasta (sem build command).
