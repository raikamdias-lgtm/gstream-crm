const db = require("../database/db");

const pagamentoController = {

    // ==========================
    // RESUMO FINANCEIRO
    // ==========================

    async resumo(req, res) {

        try {

            // RECEITA DO MÊS
            const resultado = await db.execute(`

                SELECT
                    COALESCE(
                        SUM(
                            CASE
                                WHEN strftime('%Y-%m', data_pagamento)
                                    = strftime('%Y-%m', 'now')
                                AND status = 'pago'
                                THEN valor
                                ELSE 0
                            END
                        ),
                        0
                    ) AS receitaMensal,

                    COUNT(
                        DISTINCT
                        CASE
                            WHEN strftime('%Y-%m', data_pagamento)
                                = strftime('%Y-%m', 'now')
                            AND status = 'pago'
                            THEN cliente_id
                        END
                    ) AS clientesPagantes

                FROM pagamentos

            `);


            // TOTAL DE TELAS ATIVAS
            const telas = await db.execute(`

                SELECT
                    COALESCE(SUM(telas), 0) AS totalTelas

                FROM clientes

                WHERE date(dataExpiracao) >= date('now')

            `);


            // TOTAL A RECEBER
            const receber = await db.execute(`

                SELECT
                    COALESCE(
                        SUM(c.valor),
                        0
                    ) AS aReceber

                FROM clientes c

                WHERE date(c.dataExpiracao) >= date('now')

                AND c.valor > 0

                AND NOT EXISTS (

                    SELECT 1

                    FROM pagamentos p

                    WHERE p.cliente_id = c.id

                    AND strftime(
                        '%Y-%m',
                        p.data_pagamento
                    )
                    =
                    strftime(
                        '%Y-%m',
                        'now'
                    )

                    AND p.status = 'pago'

                )

            `);


            res.json({

                sucesso: true,

                receitaMensal:
                    Number(
                        resultado.rows[0].receitaMensal || 0
                    ),

                clientesPagantes:
                    Number(
                        resultado.rows[0].clientesPagantes || 0
                    ),

                totalTelas:
                    Number(
                        telas.rows[0].totalTelas || 0
                    ),

                aReceber:
                    Number(
                        receber.rows[0].aReceber || 0
                    )

            });


        } catch (error) {

            console.error(
                "Erro no resumo financeiro:",
                error
            );


            res.status(500).json({

                sucesso: false,

                erro:
                    "Erro ao carregar resumo financeiro.",

                detalhe:
                    error.message

            });

        }

    },


    // ==========================
    // LISTAR PAGAMENTOS
    // ==========================

    async listar(req, res) {

        try {

            const resultado = await db.execute(`

                SELECT

                    p.id,

                    p.cliente_id,

                    c.name AS cliente,

                    c.plano,

                    c.telas,

                    p.valor,

                    p.data_pagamento,

                    p.competencia,

                    p.status,

                    p.descricao

                FROM pagamentos p

                INNER JOIN clientes c
                    ON c.id = p.cliente_id

                ORDER BY

                    p.data_pagamento DESC,

                    p.id DESC

            `);


            res.json({

                sucesso: true,

                pagamentos:
                    resultado.rows

            });


        } catch (error) {

            console.error(
                "Erro ao listar pagamentos:",
                error
            );


            res.status(500).json({

                sucesso: false,

                erro:
                    "Erro ao listar pagamentos.",

                detalhe:
                    error.message

            });

        }

    },


    // ==========================
    // REGISTRAR PAGAMENTO
    // ==========================

    async registrar(req, res) {

        try {

            const {

                cliente_id,
                valor,
                data_pagamento,
                competencia,
                descricao

            } = req.body;


            if (!cliente_id) {

                return res.status(400).json({

                    sucesso: false,

                    erro:
                        "Cliente não informado."

                });

            }


            // BUSCAR CLIENTE
            const cliente =
                await db.execute({

                    sql: `

                        SELECT

                            id,
                            valor,
                            plano,
                            telas

                        FROM clientes

                        WHERE id = ?

                    `,

                    args: [cliente_id]

                });


            if (cliente.rows.length === 0) {

                return res.status(404).json({

                    sucesso: false,

                    erro:
                        "Cliente não encontrado."

                });

            }


            // SE NÃO FOR INFORMADO,
            // USA O VALOR DO PLANO DO CLIENTE
            const valorPagamento =
                Number(
                    valor ??
                    cliente.rows[0].valor ??
                    0
                );


            if (valorPagamento <= 0) {

                return res.status(400).json({

                    sucesso: false,

                    erro:
                        "O valor do pagamento precisa ser maior que zero."

                });

            }


            // DATA DO PAGAMENTO
            const dataPagamento =
                data_pagamento ||
                new Date()
                    .toISOString()
                    .split("T")[0];


            // COMPETÊNCIA
            const competenciaPagamento =
                competencia ||
                dataPagamento.substring(0, 7);


            // REGISTRAR PAGAMENTO
            await db.execute({

                sql: `

                    INSERT INTO pagamentos (

                        cliente_id,
                        valor,
                        data_pagamento,
                        competencia,
                        status,
                        descricao

                    )

                    VALUES (?, ?, ?, ?, 'pago', ?)

                `,

                args: [

                    cliente_id,
                    valorPagamento,
                    dataPagamento,
                    competenciaPagamento,
                    descricao || null

                ]

            });


            res.json({

                sucesso: true,

                mensagem:
                    "Pagamento registrado com sucesso."

            });


        } catch (error) {

            console.error(
                "Erro ao registrar pagamento:",
                error
            );


            res.status(500).json({

                sucesso: false,

                erro:
                    "Erro ao registrar pagamento.",

                detalhe:
                    error.message

            });

        }

    },


    // ==========================
    // MARCAR PAGAMENTO COMO PAGO
    // ==========================

    async marcarComoPago(req, res) {

        try {

            const { id } = req.params;


            const resultado =
                await db.execute({

                    sql: `

                        UPDATE pagamentos

                        SET status = 'pago'

                        WHERE id = ?

                    `,

                    args: [id]

                });


            if (
                !resultado ||
                resultado.rowsAffected === 0
            ) {

                return res.status(404).json({

                    sucesso: false,

                    erro:
                        "Pagamento não encontrado."

                });

            }


            res.json({

                sucesso: true,

                mensagem:
                    "Pagamento marcado como pago."

            });


        } catch (error) {

            console.error(
                "Erro ao marcar pagamento:",
                error
            );


            res.status(500).json({

                sucesso: false,

                erro:
                    "Erro ao atualizar pagamento.",

                detalhe:
                    error.message

            });

        }

    }

};


module.exports = pagamentoController;
