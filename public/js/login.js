console.log("LOGIN JS CARREGOU");

const senha =
    document.getElementById("senha");

const mostrarSenha =
    document.getElementById("mostrarSenha");

const form =
    document.getElementById("loginForm");

const erroLogin =
    document.getElementById("erroLogin");


// ==========================
// MOSTRAR / ESCONDER SENHA
// ==========================

if (mostrarSenha) {

    mostrarSenha.addEventListener(
        "click",
        () => {

            if (senha.type === "password") {

                senha.type = "text";

                mostrarSenha.classList.remove(
                    "fa-eye"
                );

                mostrarSenha.classList.add(
                    "fa-eye-slash"
                );

            } else {

                senha.type = "password";

                mostrarSenha.classList.remove(
                    "fa-eye-slash"
                );

                mostrarSenha.classList.add(
                    "fa-eye"
                );

            }

        }
    );

}


// ==========================
// LOGIN
// ==========================

if (form) {

    form.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const usuario =
                document
                    .getElementById("usuario")
                    .value
                    .trim();

            const senhaDigitada =
                senha.value;


            erroLogin.textContent = "";


            try {

                const resposta =
                    await fetch(
                        "/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials: "same-origin",

                            body: JSON.stringify({

                                usuario:
                                    usuario,

                                senha:
                                    senhaDigitada

                            })

                        }
                    );


                const dados =
                    await resposta.json();


                if (
                    resposta.ok &&
                    dados.sucesso
                ) {

                    /*
                        NÃO salvamos mais
                        usuário no localStorage.

                        A autenticação agora
                        fica na sessão do servidor.
                    */

                    window.location.href =
                        "index.html";


                } else {

                    erroLogin.textContent =
                        dados.erro ||
                        "Usuário ou senha incorretos.";

                }


            } catch (error) {

                console.error(
                    "Erro no login:",
                    error
                );


                erroLogin.textContent =
                    "Erro ao conectar com o servidor.";

            }

        }
    );

}