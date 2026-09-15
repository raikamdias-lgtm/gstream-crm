const db =
    require("./db");

const bcrypt =
    require("bcrypt");


// =========================================================
// INICIALIZAR BANCO
// =========================================================

async function inicializarBanco() {

    try {

        console.log(
            "🔄 Inicializando banco..."
        );


        // =================================================
        // CLIENTES
        // =================================================

        await db.execute(`

            CREATE TABLE IF NOT EXISTS clientes (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                name TEXT NOT NULL,

                numero TEXT NOT NULL,

                usuario TEXT NOT NULL,

                aplicativo TEXT NOT NULL,

                plano TEXT DEFAULT '',

                valor REAL DEFAULT 0,

                telas INTEGER DEFAULT 1,

                dataInicio TEXT NOT NULL,

                dataPagamento TEXT NOT NULL,

                dataExpiracao TEXT NOT NULL,

                descricao TEXT,

                status TEXT DEFAULT 'ativo'

            );

        `);


        console.log(
            "✅ Tabela clientes criada/verificada."
        );


        // =================================================
        // MIGRAÇÕES DE CLIENTES
        // =================================================

        const colunasClientes = [

            {
                nome: "plano",

                sql:
                    "ALTER TABLE clientes ADD COLUMN plano TEXT DEFAULT ''"
            },

            {
                nome: "valor",

                sql:
                    "ALTER TABLE clientes ADD COLUMN valor REAL DEFAULT 0"
            },

            {
                nome: "telas",

                sql:
                    "ALTER TABLE clientes ADD COLUMN telas INTEGER DEFAULT 1"
            },

            {
                nome: "status",

                sql:
                    "ALTER TABLE clientes ADD COLUMN status TEXT DEFAULT 'ativo'"
            }

        ];


        for (
            const coluna of colunasClientes
        ) {

            try {

                await db.execute(
                    coluna.sql
                );


                console.log(
                    `✅ Coluna ${coluna.nome} adicionada.`
                );


            } catch (erro) {

                if (
                    !erro.message
                        .toLowerCase()
                        .includes(
                            "duplicate column"
                        )
                ) {

                    console.error(
                        `Erro na coluna ${coluna.nome}:`,
                        erro.message
                    );

                }

            }

        }


        // =================================================
        // PAGAMENTOS
        // =================================================

        await db.execute(`

            CREATE TABLE IF NOT EXISTS pagamentos (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                cliente_id INTEGER NOT NULL,

                valor REAL NOT NULL DEFAULT 0,

                data_pagamento TEXT NOT NULL,

                competencia TEXT,

                status TEXT DEFAULT 'pago',

                descricao TEXT,

                FOREIGN KEY (cliente_id)
                    REFERENCES clientes(id)

            );

        `);


        console.log(
            "✅ Tabela pagamentos criada/verificada."
        );


        // =================================================
        // GARANTIR COMPETENCIA
        // =================================================

        try {

            await db.execute(`

                ALTER TABLE pagamentos
                ADD COLUMN competencia TEXT

            `);


            console.log(
                "✅ Coluna competencia adicionada."
            );


        } catch (erro) {

            if (
                !erro.message
                    .toLowerCase()
                    .includes(
                        "duplicate column"
                    )
            ) {

                console.error(
                    "Erro na coluna competencia:",
                    erro.message
                );

            }

        }


        // =================================================
        // GARANTIR STATUS
        // =================================================

        try {

            await db.execute(`

                ALTER TABLE pagamentos
                ADD COLUMN status TEXT DEFAULT 'pago'

            `);


            console.log(
                "✅ Coluna status adicionada."
            );


        } catch (erro) {

            if (
                !erro.message
                    .toLowerCase()
                    .includes(
                        "duplicate column"
                    )
            ) {

                console.error(
                    "Erro na coluna status:",
                    erro.message
                );

            }

        }


        // =================================================
        // GARANTIR DESCRICAO
        // =================================================

        try {

            await db.execute(`

                ALTER TABLE pagamentos
                ADD COLUMN descricao TEXT

            `);


            console.log(
                "✅ Coluna descricao adicionada."
            );


        } catch (erro) {

            if (
                !erro.message
                    .toLowerCase()
                    .includes(
                        "duplicate column"
                    )
            ) {

                console.error(
                    "Erro na coluna descricao:",
                    erro.message
                );

            }

        }


        // =================================================
        // USUÁRIOS
        // =================================================

        await db.execute(`

            CREATE TABLE IF NOT EXISTS usuarios (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                usuario TEXT UNIQUE NOT NULL,

                senha TEXT NOT NULL

            );

        `);


        console.log(
            "✅ Tabela usuarios criada/verificada."
        );


        // =================================================
        // USUÁRIO INICIAL
        // =================================================

        const resultadoUsuarios =
            await db.execute(`

                SELECT
                    COUNT(*) AS total
                FROM usuarios

            `);


        const totalUsuarios =
            Number(
                resultadoUsuarios.rows[0].total
            ) || 0;


        // =================================================
        // SÓ CRIA ADMIN SE NÃO EXISTIR NENHUM USUÁRIO
        // =================================================

        if (
            totalUsuarios === 0
        ) {

            const senhaInicial =
                "admin123";


            const senhaHash =
                await bcrypt.hash(
                    senhaInicial,
                    10
                );


            await db.execute({

                sql: `

                    INSERT INTO usuarios
                    (
                        usuario,
                        senha
                    )
                    VALUES (?, ?)

                `,

                args: [
                    "admin",
                    senhaHash
                ]

            });


            console.log(
                "✅ Usuário inicial criado."
            );

            console.log(
                "👤 Usuário inicial: admin"
            );

            console.log(
                "🔑 Senha inicial: admin123"
            );

            console.log(
                "⚠️ Altere a senha nas configurações."
            );


        } else {

            console.log(
                `ℹ️ ${totalUsuarios} usuário(s) já cadastrado(s).`
            );

        }


        // =================================================
        // FINALIZAÇÃO
        // =================================================

        console.log(
            "✅ BANCO INICIALIZADO COM SUCESSO."
        );


    } catch (error) {

        console.error(
            "❌ Erro ao inicializar banco:"
        );

        console.error(
            error
        );

    }

}


// =========================================================
// EXPORTAR
// =========================================================

module.exports =
    inicializarBanco;
