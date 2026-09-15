// =========================================================
// APP.JS
// =========================================================

console.log("APP JS CARREGADO");


// =========================================================
// VERIFICAR SESSÃO
// =========================================================

async function verificarSessao() {

    try {

        const resposta = await fetch(
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


        console.log(
            "Sessão autenticada:",
            dados.usuario
        );


        const usuarioElemento =
            document.getElementById(
                "usuarioLogado"
            );


        if (usuarioElemento) {

            usuarioElemento.textContent =
                dados.usuario;

        }


        return true;


    } catch (erro) {

        console.error(
            "Erro ao verificar sessão:",
            erro
        );


        window.location.href =
            "login.html";


        return false;

    }

}


// =========================================================
// LOGOUT
// =========================================================

async function fazerLogout() {

    try {

        await fetch(
            "/api/logout",
            {
                method: "POST",
                credentials: "same-origin"
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao fazer logout:",
            erro
        );

    }


    window.location.href =
        "login.html";

}


// =========================================================
// BOTÃO SAIR
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logout =
            document.getElementById("logout");


        if (logout) {

            logout.addEventListener(
                "click",
                fazerLogout
            );

        }

    }
);


// =========================================================
// EXPORTAR
// =========================================================

window.verificarSessao =
    verificarSessao;

window.fazerLogout =
    fazerLogout;
