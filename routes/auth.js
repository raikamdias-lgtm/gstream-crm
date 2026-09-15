const express = require("express");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");

const db =
    require("../database/db");

const router =
    express.Router();

console.log(
    "AUTH.JS CARREGADO"
);


// =====================================================
// LIMITADOR DE TENTATIVAS DE LOGIN
// =====================================================

const limiteLogin =
    rateLimit({

        windowMs:
            15 * 60 * 1000,

        max: 10,

        standardHeaders: true,

        legacyHeaders: false,

        message: {

            sucesso: false,

            erro:
                "Muitas tentativas de login. Tente novamente em alguns minutos."

        }

    });


// =====================================================
// FUNÇÃO AUXILIAR
// =====================================================

function usuarioAutenticado(req) {

    return (
        req.session &&
        req.session.usuarioId
    );

}


// =====================================================
// LISTAR USUÁRIOS
// =====================================================

router.get(
    "/usuarios",
    async (req, res) => {

        if (
            !usuarioAutenticado(req)
        ) {

            return res.status(401).json({

                sucesso: false,

                erro:
                    "Não autenticado."

            });

        }


        try {

            const resultado =
                await db.execute(
                    "SELECT id, usuario FROM usuarios"
                );


            res.json({

                sucesso: true,

                usuarios:
                    resultado.rows

            });


        } catch (erro) {

            console.error(
                "Erro ao listar usuários:",
                erro
            );


            res.status(500).json({

                sucesso: false,

                erro:
                    "Erro no banco."

            });

        }

    }
);


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    limiteLogin,
    async (req, res) => {

        const {
            usuario,
            senha
        } = req.body;


        try {

            if (
                typeof usuario !== "string" ||
                typeof senha !== "string" ||
                !usuario.trim() ||
                !senha
            ) {

                return res.status(400).json({

                    sucesso: false,

                    erro:
                        "Usuário e senha são obrigatórios."

                });

            }


            const usuarioLimpo =
                usuario.trim();


            const resultado =
                await db.execute({

                    sql:
                        `
                        SELECT *
                        FROM usuarios
                        WHERE usuario = ?
                        `,

                    args: [
                        usuarioLimpo
                    ]

                });


            if (
                resultado.rows.length === 0
            ) {

                return res.status(401).json({

                    sucesso: false,

                    erro:
                        "Usuário ou senha incorretos."

                });

            }


            const user =
                resultado.rows[0];


            const senhaCorreta =
                await bcrypt.compare(
                    senha,
                    user.senha
                );


            if (!senhaCorreta) {

                return res.status(401).json({

                    sucesso: false,

                    erro:
                        "Usuário ou senha incorretos."

                });

            }


            // =========================================
            // REGENERAR SESSÃO APÓS LOGIN
            // =========================================

            req.session.regenerate(
                (erro) => {

                    if (erro) {

                        console.error(
                            "Erro ao regenerar sessão:",
                            erro
                        );

                        return res.status(500).json({

                            sucesso: false,

                            erro:
                                "Não foi possível iniciar a sessão."

                        });

                    }


                    req.session.usuarioId =
                        user.id;

                    req.session.usuario =
                        user.usuario;


                    req.session.save(
                        (erro) => {

                            if (erro) {

                                console.error(
                                    "Erro ao salvar sessão:",
                                    erro
                                );

                                return res.status(500).json({

                                    sucesso: false,

                                    erro:
                                        "Não foi possível salvar a sessão."

                                });

                            }


                            return res.json({

                                sucesso: true,

                                usuario:
                                    user.usuario

                            });

                        }
                    );

                }
            );


        } catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );


            res.status(500).json({

                sucesso: false,

                erro:
                    "Erro no servidor."

            });

        }

    }
);


// =====================================================
// VERIFICAR SESSÃO
// =====================================================

router.get(
    "/sessao",
    (req, res) => {

        if (
            !usuarioAutenticado(req)
        ) {

            return res.status(401).json({

                autenticado: false

            });

        }


        res.json({

            autenticado: true,

            usuario:
                req.session.usuario

        });

    }
);


// =====================================================
// ALTERAR USUÁRIO E/OU SENHA
// =====================================================

router.put(
    "/conta",
    async (req, res) => {

        if (
            !usuarioAutenticado(req)
        ) {

            return res.status(401).json({

                sucesso: false,

                erro:
                    "Não autenticado."

            });

        }


        const usuarioId =
            req.session.usuarioId;


        const {
            senhaAtual,
            novoUsuario,
            novaSenha
        } = req.body;


        try {

            if (
                typeof senhaAtual !== "string" ||
                !senhaAtual
            ) {

                return res.status(400).json({

                    sucesso: false,

                    erro:
                        "Informe sua senha atual."

                });

            }


            const resultado =
                await db.execute({

                    sql:
                        `
                        SELECT *
                        FROM usuarios
                        WHERE id = ?
                        `,

                    args: [
                        usuarioId
                    ]

                });


            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({

                    sucesso: false,

                    erro:
                        "Usuário não encontrado."

                });

            }


            const usuario =
                resultado.rows[0];


            const senhaCorreta =
                await bcrypt.compare(
                    senhaAtual,
                    usuario.senha
                );


            if (!senhaCorreta) {

                return res.status(401).json({

                    sucesso: false,

                    erro:
                        "A senha atual está incorreta."

                });

            }


            let usuarioFinal =
                usuario.usuario;


            if (
                novoUsuario !== undefined
            ) {

                if (
                    typeof novoUsuario !== "string"
                ) {

                    return res.status(400).json({

                        sucesso: false,

                        erro:
                            "Usuário inválido."

                    });

                }


                usuarioFinal =
                    novoUsuario.trim();


                if (
                    usuarioFinal.length < 3
                ) {

                    return res.status(400).json({

                        sucesso: false,

                        erro:
                            "O novo usuário deve ter pelo menos 3 caracteres."

                    });

                }


                if (
                    usuarioFinal.length > 50
                ) {

                    return res.status(400).json({

                        sucesso: false,

                        erro:
                            "O novo usuário deve ter no máximo 50 caracteres."

                    });

                }


                const usuarioExistente =
                    await db.execute({

                        sql:
                            `
                            SELECT id
                            FROM usuarios
                            WHERE usuario = ?
                            AND id != ?
                            `,

                        args: [
                            usuarioFinal,
                            usuarioId
                        ]

                    });


                if (
                    usuarioExistente.rows.length > 0
                ) {

                    return res.status(409).json({

                        sucesso: false,

                        erro:
                            "Esse usuário já está sendo utilizado."

                    });

                }

            }


            let senhaFinal =
                usuario.senha;


            if (
                novaSenha !== undefined
            ) {

                if (
                    typeof novaSenha !== "string"
                ) {

                    return res.status(400).json({

                        sucesso: false,

                        erro:
                            "Nova senha inválida."

                    });

                }


                if (
                    novaSenha.length < 6
                ) {

                    return res.status(400).json({

                        sucesso: false,

                        erro:
                            "A nova senha deve ter pelo menos 6 caracteres."

                    });

                }


                if (
                    novaSenha.length > 100
                ) {

                    return res.status(400).json({

                        sucesso: false,

                        erro:
                            "A nova senha é muito longa."

                    });

                }


                if (
                    novaSenha === senhaAtual
                ) {

                    return res.status(400).json({

                        sucesso: false,

                        erro:
                            "A nova senha deve ser diferente da senha atual."

                    });

                }


                senhaFinal =
                    await bcrypt.hash(
                        novaSenha,
                        10
                    );

            }


            const alterouUsuario =
                usuarioFinal !==
                usuario.usuario;


            const alterouSenha =
                novaSenha !== undefined;


            if (
                !alterouUsuario &&
                !alterouSenha
            ) {

                return res.status(400).json({

                    sucesso: false,

                    erro:
                        "Nenhuma alteração foi informada."

                });

            }


            await db.execute({

                sql:
                    `
                    UPDATE usuarios
                    SET
                        usuario = ?,
                        senha = ?
                    WHERE id = ?
                    `,

                args: [
                    usuarioFinal,
                    senhaFinal,
                    usuarioId
                ]

            });


            req.session.usuario =
                usuarioFinal;


            if (
                alterouSenha
            ) {

                return req.session.destroy(
                    (erro) => {

                        if (erro) {

                            console.error(
                                "Erro ao encerrar sessão:",
                                erro
                            );

                            return res.status(500).json({

                                sucesso: false,

                                erro:
                                    "Dados alterados, mas houve erro ao encerrar a sessão."

                            });

                        }


                        res.clearCookie(
                            "connect.sid"
                        );


                        return res.json({

                            sucesso: true,

                            logoutNecessario: true,

                            mensagem:
                                "Dados alterados com sucesso. Faça login novamente."

                        });

                    }
                );

            }


            res.json({

                sucesso: true,

                logoutNecessario: false,

                usuario:
                    usuarioFinal,

                mensagem:
                    "Usuário alterado com sucesso."

            });


        } catch (erro) {

            console.error(
                "Erro ao alterar conta:",
                erro
            );


            res.status(500).json({

                sucesso: false,

                erro:
                    "Erro ao alterar os dados da conta."

            });

        }

    }
);


// =====================================================
// LOGOUT
// =====================================================

router.post(
    "/logout",
    (req, res) => {

        if (!req.session) {

            return res.json({

                sucesso: true

            });

        }


        req.session.destroy(
            (erro) => {

                if (erro) {

                    console.error(
                        "Erro ao encerrar sessão:",
                        erro
                    );


                    return res.status(500).json({

                        sucesso: false,

                        erro:
                            "Erro ao sair."

                    });

                }


                res.clearCookie(
                    "connect.sid"
                );


                res.json({

                    sucesso: true,

                    mensagem:
                        "Sessão encerrada."

                });

            }
        );

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    router;


