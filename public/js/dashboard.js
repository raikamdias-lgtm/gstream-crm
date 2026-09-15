// ==========================
// VERIFICAR SESSÃO
// ==========================

async function verificarSessao() {

    try {

        const resposta =
            await fetch(
                "/api/sessao",
                {
                    credentials: "same-origin"
                }
            );


        if (!resposta.ok) {

            window.location.href =
                "login.html";

            return false;

        }


        const dados =
            await resposta.json();


        if (!dados.autenticado) {

            window.location.href =
                "login.html";

            return false;

        }


        const usuarioElemento =
            document.getElementById(
                "usuarioLogado"
            );


        if (usuarioElemento) {

            usuarioElemento.textContent =
                dados.usuario;

        }


        return true;


    } catch (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );


        window.location.href =
            "login.html";

        return false;

    }

}


// ==========================
// DATA ATUAL
// ==========================

function carregarDataAtual() {

    const hoje =
        new Date();


    const dataElemento =
        document.getElementById(
            "dataHoje"
        );


    if (dataElemento) {

        dataElemento.textContent =
            hoje.toLocaleDateString(
                "pt-BR"
            );

    }

}


// ==========================
// CARREGAR DASHBOARD
// ==========================

async function carregarDashboard() {

    try {

        const resposta =
            await fetch(
                "/api/clientes/dashboard",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (resposta.status === 401) {

            window.location.href =
                "login.html";

            return;

        }


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar dashboard"
            );

        }


        const dados =
            await resposta.json();


        const ativos =
            document.getElementById(
                "ativos"
            );

        const inativos =
            document.getElementById(
                "inativos"
            );

        const vencendo =
            document.getElementById(
                "vencendo"
            );

        const total =
            document.getElementById(
                "total"
            );


        if (ativos) {

            ativos.textContent =
                dados.ativos || 0;

        }


        if (inativos) {

            inativos.textContent =
                dados.inativos || 0;

        }


        if (vencendo) {

            vencendo.textContent =
                dados.vencendo || 0;

        }


        if (total) {

            total.textContent =
                dados.total || 0;

        }


    } catch (error) {

        console.error(
            "Erro dashboard:",
            error
        );

    }

}


// ==========================
// LOGOUT
// ==========================

const logout =
    document.getElementById(
        "logout"
    );


if (logout) {

    logout.addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    "/api/logout",
                    {
                        method: "POST",

                        credentials:
                            "same-origin"
                    }
                );

            } catch (error) {

                console.error(
                    "Erro ao sair:",
                    error
                );

            }


            window.location.href =
                "login.html";

        }
    );

}


// ==========================
// INICIALIZAÇÃO
// ==========================

async function iniciarDashboard() {

    const autenticado =
        await verificarSessao();


    if (!autenticado) {

        return;

    }


    carregarDataAtual();

    carregarDashboard();


    setInterval(
        carregarDashboard,
        60000
    );

}


iniciarDashboard();