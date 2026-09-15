const db = require("../database/db");


// =========================================================
// FORMATAR DATA
// =========================================================

function formatarDataSemFuso(data) {

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


// =========================================================
// CONTROLLER
// =========================================================

const clienteController = {


    // =====================================================
    // DASHBOARD
    // =====================================================

    async dashboard(req, res) {

        try {

            const resultado =
                await db.execute(`
                    SELECT
                        dataExpiracao,
                        valor
                    FROM clientes
                `);


            const clientes =
                resultado.rows || [];


            const hoje =
                new Date();

            hoje.setHours(
                0,
                0,
                0,
                0
            );


            let ativos = 0;
            let inativos = 0;
            let vencendo = 0;
            let mensal = 0;


            clientes.forEach(cliente => {

                if (!cliente.dataExpiracao) {

                    inativos++;

                    return;
                }


                const partes =
                    String(
                        cliente.dataExpiracao
                    )
                    .split("T")[0]
                    .split("-");


                if (partes.length !== 3) {

                    inativos++;

                    return;
                }


                const ano =
                    Number(partes[0]);

                const mes =
                    Number(partes[1]) - 1;

                const dia =
                    Number(partes[2]);


                const vencimento =
                    new Date(
                        ano,
                        mes,
                        dia
                    );


                vencimento.setHours(
                    0,
                    0,
                    0,
                    0
                );


                const diferencaDias =
                    Math.ceil(
                        (
                            vencimento -
                            hoje
                        ) /
                        (1000 * 60 * 60 * 24)
                    );


                if (
                    diferencaDias < 0
                ) {

                    inativos++;

                } else {

                    ativos++;

                    mensal +=
                        Number(
                            cliente.valor
                        ) || 0;


                    if (
                        diferencaDias <= 3
                    ) {

                        vencendo++;

                    }

                }

            });


            res.json({

                total:
                    clientes.length,

                ativos,

                inativos,

                vencendo,

                mensal

            });


        } catch (error) {

            console.error(
                "Erro no dashboard:",
                error
            );


            res.status(500).json({

                erro:
                    "Erro ao carregar dashboard."

            });

        }

    },


    // =====================================================
    // LISTAR
    // =====================================================

    async listar(req, res) {

        try {

            const { busca } =
                req.query;


            let sql =
                `SELECT * FROM clientes`;

            let args = [];


            if (busca) {

                sql += `
                    WHERE
                        name LIKE ?
                        OR numero LIKE ?
                        OR usuario LIKE ?
                        OR aplicativo LIKE ?
                        OR plano LIKE ?
                `;


                const termo =
                    `%${busca}%`;


                args = [
                    termo,
                    termo,
                    termo,
                    termo,
                    termo
                ];

            }


            sql +=
                ` ORDER BY id DESC`;


            const resultado =
                await db.execute({
                    sql,
                    args
                });


            res.json(
                resultado.rows
            );


        } catch (error) {

            console.error(
                "Erro ao listar:",
                error
            );


            res.status(500).json({

                erro:
                    "Erro ao listar clientes.",

                detalhe:
                    error.message

            });

        }

    },


    // =====================================================
    // BUSCAR
    // =====================================================

    async buscar(req, res) {

        try {

            const { id } =
                req.params;


            const resultado =
                await db.execute({

                    sql: `
                        SELECT *
                        FROM clientes
                        WHERE id = ?
                    `,

                    args: [id]

                });


            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({

                    erro:
                        "Cliente não encontrado."

                });

            }


            res.json(
                resultado.rows[0]
            );


        } catch (error) {

            console.error(
                "Erro ao buscar cliente:",
                error
            );


            res.status(500).json({

                erro:
                    "Erro ao buscar cliente.",

                detalhe:
                    error.message

            });

        }

    },


    // =====================================================
    // CADASTRAR
    // =====================================================

    async cadastrar(req, res) {

        try {

            const {

                name,
                numero,
                usuario,
                aplicativo,
                plano,
                valor,
                telas,
                dataInicio,
                dataPagamento,
                dataExpiracao,
                descricao

            } = req.body;


            if (
                !name ||
                !numero ||
                !usuario ||
                !aplicativo ||
                !dataPagamento ||
                !dataExpiracao
            ) {

                return res.status(400).json({

                    erro:
                        "Preencha todos os campos obrigatórios."

                });

            }


            await db.execute({

                sql: `
                    INSERT INTO clientes
                    (
                        name,
                        numero,
                        usuario,
                        aplicativo,
                        plano,
                        valor,
                        telas,
                        dataInicio,
                        dataPagamento,
                        dataExpiracao,
                        descricao,
                        status
                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?, 'ativo'
                    )
                `,

                args: [

                    name,

                    numero,

                    usuario,

                    aplicativo,

                    plano || "",

                    Number(valor || 0),

                    Number(telas || 1),

                    dataInicio || dataPagamento,

                    dataPagamento,

                    dataExpiracao,

                    descricao || ""

                ]

            });


            res.status(201).json({

                sucesso:
                    true,

                mensagem:
                    "Cliente cadastrado com sucesso."

            });


        } catch (error) {

            console.error(
                "Erro ao cadastrar cliente:",
                error
            );


            res.status(500).json({

                erro:
                    "Erro ao cadastrar cliente.",

                detalhe:
                    error.message

            });

        }

    },


    // =====================================================
    // ATUALIZAR
    // =====================================================

    async atualizar(req, res) {

        try {

            const { id } =
                req.params;


            const {

                name,
                numero,
                usuario,
                aplicativo,
                plano,
                valor,
                telas,
                dataInicio,
                dataPagamento,
                dataExpiracao,
                descricao

            } = req.body;


            const cliente =
                await db.execute({

                    sql: `
                        SELECT id
                        FROM clientes
                        WHERE id = ?
                    `,

                    args: [id]

                });


            if (
                cliente.rows.length === 0
            ) {

                return res.status(404).json({

                    erro:
                        "Cliente não encontrado."

                });

            }


            await db.execute({

                sql: `
                    UPDATE clientes

                    SET
                        name = ?,
                        numero = ?,
                        usuario = ?,
                        aplicativo = ?,
                        plano = ?,
                        valor = ?,
                        telas = ?,
                        dataInicio = ?,
                        dataPagamento = ?,
                        dataExpiracao = ?,
                        descricao = ?

                    WHERE id = ?
                `,

                args: [

                    name,

                    numero,

                    usuario,

                    aplicativo,

                    plano || "",

                    Number(valor || 0),

                    Number(telas || 1),

                    dataInicio || dataPagamento,

                    dataPagamento,

                    dataExpiracao,

                    descricao || "",

                    id

                ]

            });


            res.json({

                sucesso:
                    true,

                mensagem:
                    "Cliente atualizado com sucesso."

            });


        } catch (error) {

            console.error(
                "ERRO AO ATUALIZAR CLIENTE:",
                error
            );


            res.status(500).json({

                erro:
                    "Erro ao atualizar cliente.",

                detalhe:
                    error.message

            });

        }

    },


    // =====================================================
    // RENOVAR
    // =====================================================

    async renovar(req, res) {

        try {

            const { id } =
                req.params;


            const resultado =
                await db.execute({

                    sql: `
                        SELECT *
                        FROM clientes
                        WHERE id = ?
                    `,

                    args: [id]

                });


            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({

                    erro:
                        "Cliente não encontrado."

                });

            }


            const cliente =
                resultado.rows[0];


            const hoje =
                new Date();

            hoje.setHours(
                0,
                0,
                0,
                0
            );


            const dataPagamento =
                formatarDataSemFuso(
                    hoje
                );


            let novaDataBase;


            if (
                cliente.dataExpiracao
            ) {

                const partes =
                    cliente.dataExpiracao
                        .split("-")
                        .map(Number);


                const vencimentoAtual =
                    new Date(
                        partes[0],
                        partes[1] - 1,
                        partes[2]
                    );


                vencimentoAtual.setHours(
                    0,
                    0,
                    0,
                    0
                );


                if (
                    vencimentoAtual > hoje
                ) {

                    novaDataBase =
                        vencimentoAtual;

                } else {

                    novaDataBase =
                        new Date(hoje);

                }

            } else {

                novaDataBase =
                    new Date(hoje);

            }


            novaDataBase.setMonth(
                novaDataBase.getMonth() + 1
            );


            const novaExpiracao =
                formatarDataSemFuso(
                    novaDataBase
                );


            await db.execute({

                sql: `
                    UPDATE clientes

                    SET
                        dataPagamento = ?,
                        dataExpiracao = ?,
                        status = 'ativo'

                    WHERE id = ?
                `,

                args: [

                    dataPagamento,

                    novaExpiracao,

                    id

                ]

            });


            await db.execute({

                sql: `
                    INSERT INTO pagamentos
                    (
                        cliente_id,
                        valor,
                        data_pagamento,
                        descricao
                    )
                    VALUES (?, ?, ?, ?)
                `,

                args: [

                    id,

                    Number(
                        cliente.valor || 0
                    ),

                    dataPagamento,

                    "Renovação de plano"

                ]

            });


            res.json({

                sucesso:
                    true,

                novaData:
                    novaExpiracao,

                mensagem:
                    "Cliente renovado com sucesso."

            });


        } catch (error) {

            console.error(
                "Erro ao renovar:",
                error
            );


            res.status(500).json({

                erro:
                    "Erro ao renovar cliente.",

                detalhe:
                    error.message

            });

        }

    },


    // =====================================================
    // EXCLUIR
    // =====================================================

    async excluir(req, res) {

        try {

            const { id } =
                req.params;


            await db.execute({

                sql: `
                    DELETE FROM clientes
                    WHERE id = ?
                `,

                args: [id]

            });


            res.json({

                sucesso:
                    true,

                mensagem:
                    "Cliente excluído com sucesso."

            });


        } catch (error) {

            console.error(
                "Erro ao excluir:",
                error
            );


            res.status(500).json({

                erro:
                    "Erro ao excluir cliente.",

                detalhe:
                    error.message

            });

        }

    }

};


module.exports =
    clienteController;
