require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const session = require("express-session");

const inicializarBanco =
    require("./database/init");

const sessionStore =
    require("./database/sessionStore");

const authRoutes =
    require("./routes/auth");

const clientesRoutes =
    require("./routes/clientes");

const pagamentosRoutes =
    require("./routes/pagamentos");

const verificarAutenticacao =
    require("./middleware/auth");

const app = express();

const PORT =
    process.env.PORT || 3000;

const producao =
    process.env.NODE_ENV === "production";


// ==========================
// SEGURANÇA
// ==========================

if (!process.env.SESSION_SECRET) {
    console.error(
        "❌ SESSION_SECRET não configurado no .env"
    );
    process.exit(1);
}

if (!process.env.TURSO_DATABASE_URL) {
    console.error(
        "❌ TURSO_DATABASE_URL não configurado no .env"
    );
    process.exit(1);
}

if (!process.env.TURSO_AUTH_TOKEN) {
    console.error(
        "❌ TURSO_AUTH_TOKEN não configurado no .env"
    );
    process.exit(1);
}

if (producao) {
    app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(helmet());


// ==========================
// MIDDLEWARES BÁSICOS
// ==========================

app.use(
    express.json({
        limit: "100kb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "100kb"
    })
);

app.use(express.static("public"));


// ==========================
// SESSÃO
// ==========================

app.use(
    session({
        name: "gstream.sid",

        secret: process.env.SESSION_SECRET,

        store: sessionStore,

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure: producao,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 8
        }
    })
);


// ==========================
// ROTAS DE AUTENTICAÇÃO
// ==========================

app.use("/api", authRoutes);


// ==========================
// ROTAS DE CLIENTES
// PROTEGIDAS
// ==========================

app.use(
    "/api/clientes",
    verificarAutenticacao,
    clientesRoutes
);


// ==========================
// ROTAS FINANCEIRAS
// PROTEGIDAS
// ==========================

app.use(
    "/api/pagamentos",
    verificarAutenticacao,
    pagamentosRoutes
);


// ==========================
// PÁGINA INICIAL
// ==========================

app.get("/", (req, res) => {
    res.sendFile(
        __dirname +
        "/public/login.html"
    );
});


// ==========================
// TRATAMENTO DE ERRO
// ==========================

app.use((err, req, res, next) => {
    console.error("Erro interno:", err);

    res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor."
    });
});


// ==========================
// INICIALIZAÇÃO
// ==========================

async function iniciar() {
    try {
        console.log(
            "SERVIDOR PRINCIPAL CARREGADO"
        );

        await inicializarBanco();

        app.listen(PORT, () => {
            console.log(
                `🚀 Servidor rodando em http://localhost:${PORT}`
            );

            console.log(
                "🔐 Autenticação por sessão ativada."
            );

            console.log(
                "🛡️ Proteções de segurança ativadas."
            );

            console.log(
                "💾 Sessões persistentes no Turso ativadas."
            );

            console.log(
                "👥 API clientes protegida."
            );

            console.log(
                "💰 API financeira protegida."
            );

            console.log(
                "🔑 Alteração de login e senha ativada."
            );
        });
    } catch (erro) {
        console.error(
            "❌ Erro ao iniciar servidor:"
        );

        console.error(erro);
        process.exit(1);
    }
}

iniciar();


