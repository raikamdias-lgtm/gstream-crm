// ==========================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==========================

function verificarAutenticacao(
    req,
    res,
    next
) {

    // =========================================
    // VERIFICAR SESSÃO
    // =========================================

    if (
        !req.session ||
        !req.session.usuarioId
    ) {

        return res.status(401).json({

            sucesso: false,

            autenticado: false,

            erro:
                "Não autorizado. Faça login."

        });

    }


    // =========================================
    // USUÁRIO AUTENTICADO
    // =========================================

    next();

}


module.exports =
    verificarAutenticacao;
