console.log(
    "SEGURANCA JS CARREGADO"
);


// =====================================================
// ELEMENTOS
// =====================================================

const form =
    document.getElementById(
        "formSeguranca"
    );


const mensagem =
    document.getElementById(
        "mensagemSeguranca"
    );


const botaoSalvar =
    document.getElementById(
        "btnSalvar"
    );


// =====================================================
// MOSTRAR / ESCONDER SENHA
// =====================================================

document
    .querySelectorAll(
        ".mostrar-senha"
    )
    .forEach(
        botao => {

            botao.addEventListener(
                "click",
                function () {

                    const targetId =
                        this.dataset.target;


                    const input =
                        document.getElementById(
                            targetId
                        );


                    if (!input) {
                        return;
                    }


                    const icone =
                        this.querySelector(
                            "i"
                        );


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";


                        if (icone) {

                            icone.classList
                                .remove(
                                    "fa-eye"
                                );

                            icone.classList
                                .add(
                                    "fa-eye-slash"
                                );

                        }

                    } else {

                        input.type =
                            "password";


                        if (icone) {

                            icone.classList
                                .remove(
                                    "fa-eye-slash"
                                );

                            icone.classList
                                .add(
                                    "fa-eye"
                                );

                        }

                    }

                }
            );

        }
    );


// =====================================================
// VERIFICAR SESSÃO
// =====================================================

async function verificarSessao() {

    try {

        const resposta =
            await fetch(
                "/api/sessao",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (
            !resposta.ok
        ) {

            window.location.href =
                "/login.html";

            return;

        }


        const dados =
            await resposta.json();


        if (
            !dados.autenticado
        ) {

            window.location.href =
                "/login.html";

        }

    } catch (erro) {

        console.error(
            "Erro ao verificar sessão:",
            erro
        );


        window.location.href =
            "/login.html";

    }

}


// =====================================================
// MENSAGEM
// =====================================================

function mostrarMensagem(
    texto,
    tipo
) {

    if (!mensagem) {
        return;
    }


    mensagem.textContent =
        texto;


    mensagem.className =
        "mensagem " +
        tipo;


    mensagem.style.display =
        "flex";

}


// =====================================================
// LIMPAR MENSAGEM
// =====================================================

function limparMensagem() {

    if (!mensagem) {
        return;
    }


    mensagem.textContent =
        "";


    mensagem.className =
        "mensagem";


    mensagem.style.display =
        "none";

}


// =====================================================
// ENVIAR ALTERAÇÃO
// =====================================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            limparMensagem();


            const senhaAtual =
                document.getElementById(
                    "senhaAtual"
                ).value;


            const novoUsuario =
                document.getElementById(
                    "novoUsuario"
                ).value.trim();


            const novaSenha =
                document.getElementById(
                    "novaSenha"
                ).value;


            const confirmarSenha =
                document.getElementById(
                    "confirmarSenha"
                ).value;


            // =========================================
            // SENHA ATUAL
            // =========================================

            if (
                !senhaAtual
            ) {

                mostrarMensagem(
                    "Digite sua senha atual.",
                    "erro"
                );

                return;

            }


            // =========================================
            // NOVO USUÁRIO
            // =========================================

            if (
                novoUsuario &&
                novoUsuario.length < 3
            ) {

                mostrarMensagem(
                    "O novo usuário deve ter pelo menos 3 caracteres.",
                    "erro"
                );

                return;

            }


            // =========================================
            // NOVA SENHA
            // =========================================

            if (
                novaSenha &&
                novaSenha.length < 6
            ) {

                mostrarMensagem(
                    "A nova senha deve ter pelo menos 6 caracteres.",
                    "erro"
                );

                return;

            }


            // =========================================
            // CONFIRMAÇÃO
            // =========================================

            if (
                novaSenha
            ) {

                if (
                    novaSenha !==
                    confirmarSenha
                ) {

                    mostrarMensagem(
                        "A confirmação da nova senha não confere.",
                        "erro"
                    );

                    return;

                }

            }


            // =========================================
            // VERIFICAR SE ALTEROU ALGO
            // =========================================

            if (
                !novoUsuario &&
                !novaSenha
            ) {

                mostrarMensagem(
                    "Informe um novo usuário ou uma nova senha.",
                    "erro"
                );

                return;

            }


            // =========================================
            // DESABILITAR BOTÃO
            // =========================================

            const textoOriginal =
                botaoSalvar
                    ? botaoSalvar.innerHTML
                    : "";


            if (botaoSalvar) {

                botaoSalvar.disabled =
                    true;


                botaoSalvar.innerHTML = `

                    <i
                        class="fa-solid fa-spinner fa-spin">
                    </i>

                    Salvando...

                `;

            }


            try {

                const resposta =
                    await fetch(
                        "/api/conta",
                        {
                            method: "PUT",

                            credentials:
                                "same-origin",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    senhaAtual:
                                        senhaAtual,

                                    novoUsuario:
                                        novoUsuario,

                                    novaSenha:
                                        novaSenha

                                })

                        }
                    );


                const dados =
                    await resposta.json();


                // =====================================
                // ERRO
                // =====================================

                if (
                    !resposta.ok ||
                    !dados.sucesso
                ) {

                    throw new Error(
                        dados.erro ||
                        "Não foi possível alterar os dados."
                    );

                }


                // =====================================
                // SENHA ALTERADA
                // =====================================

                if (
                    dados.logoutNecessario
                ) {

                    mostrarMensagem(
                        "Dados alterados com sucesso! Redirecionando para o login...",
                        "sucesso"
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                "/login.html";

                        },
                        1800
                    );


                    return;

                }


                // =====================================
                // APENAS USUÁRIO ALTERADO
                // =====================================

                mostrarMensagem(
                    dados.mensagem ||
                    "Dados alterados com sucesso.",
                    "sucesso"
                );


                document.getElementById(
                    "senhaAtual"
                ).value = "";


                document.getElementById(
                    "novaSenha"
                ).value = "";


                document.getElementById(
                    "confirmarSenha"
                ).value = "";


                document.getElementById(
                    "novoUsuario"
                ).value = "";


            } catch (erro) {

                console.error(
                    "Erro ao alterar conta:",
                    erro
                );


                mostrarMensagem(
                    erro.message ||
                    "Erro ao alterar os dados.",
                    "erro"
                );


            } finally {

                if (botaoSalvar) {

                    botaoSalvar.disabled =
                        false;


                    botaoSalvar.innerHTML =
                        textoOriginal;

                }

            }

        }
    );

}


// =====================================================
// INICIAR
// =====================================================

verificarSessao();
