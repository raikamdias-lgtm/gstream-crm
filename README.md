# Gstream CRM

CRM web para gerenciamento de clientes, pagamentos e vencimentos.

## Tecnologias

- Node.js
- Express
- Express Session
- Turso / libSQL
- bcrypt
- Helmet
- express-rate-limit

## Configuração local

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` baseado em `.env.example`.

3. Preencha as variáveis do Turso, `SESSION_SECRET` e `INITIAL_ADMIN_PASSWORD`.

4. Inicie:

```bash
npm start
```

O arquivo `.env` nunca deve ser enviado ao GitHub.

## Segurança

As credenciais e segredos são fornecidos por variáveis de ambiente. As sessões autenticadas são armazenadas no Turso, e não no MemoryStore padrão do Express.
