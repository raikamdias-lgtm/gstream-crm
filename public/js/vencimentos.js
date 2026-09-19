console.log("VENCIMENTOS JS CARREGADO");
console.log("TESTE EMOJI: ⚠️ 📺 🎬 🍿 ✅ 💠 📱 🛠️");
// =========================================================
// CARREGAR VENCIMENTOS
// =========================================================

async function carregarVencimentos() {
    try {
        const resposta = await fetch("/api/clientes", {
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao buscar clientes.");
        }

        const clientes = await resposta.json();

        const lista =
            document.getElementById("listaVencimentos");

        if (!lista) {
            console.warn(
                "Elemento #listaVencimentos não encontrado."
            );
            return;
        }

        lista.innerHTML = "";

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // =====================================================
        // FILTRAR CLIENTES VENCENDO
        // =====================================================

        const vencendo = clientes.filter(cliente => {
            if (!cliente.dataExpiracao) {
                return false;
            }

            const data = new Date(
                cliente.dataExpiracao + "T00:00:00"
            );

            if (isNaN(data.getTime())) {
                return false;
            }

            const diferenca =
                data.getTime() - hoje.getTime();

            const dias =
                Math.ceil(
                    diferenca /
                    (1000 * 60 * 60 * 24)
                );

            return dias >= 0 && dias <= 3;
        });

        // =====================================================
        // NENHUM VENCIMENTO
        // =====================================================

        if (vencendo.length === 0) {
            lista.innerHTML = `
                <div class="sem-clientes">
                    <i class="fa-solid fa-circle-check"></i>

                    <p>
                        Nenhum cliente vencendo nos próximos 3 dias.
                    </p>
                </div>
            `;

            return;
        }

        // =====================================================
        // MOSTRAR CLIENTES
        // =====================================================

        vencendo.forEach(cliente => {
            const numero =
                cliente.numero ||
                cliente.whatsapp ||
                "";

            const nome =
                cliente.name ||
                cliente.nome ||
                "Cliente";

            const vencimento =
                typeof formatarData === "function"
                    ? formatarData(cliente.dataExpiracao)
                    : cliente.dataExpiracao;

            const plano =
                cliente.plano || "-";

            const valor =
                Number(cliente.valor || 0)
                    .toFixed(2)
                    .replace(".", ",");

            const card =
                document.createElement("div");

            card.className =
                "cliente-card compacto";

            card.innerHTML = `
                <div class="cliente-info">

                    <h3>
                        ${escaparHTML(nome)}
                    </h3>

                    <p>
                        <strong>Plano:</strong>
                        ${escaparHTML(plano)}
                    </p>

                    <p>
                        <strong>Valor:</strong>
                        R$ ${valor}
                    </p>

                    <p>
                        <strong>Vencimento:</strong>
                        ${escaparHTML(vencimento)}
                    </p>

                </div>

                <div class="acoes-vencimento">

                    <button
                        type="button"
                        class="btn-cobrar"
                    >
                        <i class="fa-brands fa-whatsapp"></i>
                        Cobrar
                    </button>

                </div>
            `;

            // =================================================
            // EVENTO DO BOTÃO
            // =================================================

            const botao =
                card.querySelector(".btn-cobrar");

            botao.addEventListener(
                "click",
                () => {
                    enviarCobranca(
                        numero,
                        nome,
                        cliente.dataExpiracao
                    );
                }
            );

            lista.appendChild(card);
        });

    } catch (error) {
        console.error(
            "Erro ao carregar vencimentos:",
            error
        );

        const lista =
            document.getElementById(
                "listaVencimentos"
            );

        if (lista) {
            lista.innerHTML = `
                <div class="sem-clientes">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        Não foi possível carregar os vencimentos.
                    </p>

                </div>
            `;
        }
    }
}

// =========================================================
// ESCAPAR HTML
// =========================================================

function escaparHTML(texto) {
    if (
        texto === null ||
        texto === undefined
    ) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =========================================================
// COBRAR CLIENTE PELO WHATSAPP
// =========================================================

function enviarCobranca(numero, nome, dataExpiracao) {
    console.log(
        "Tentando cobrar cliente:",
        {
            numero,
            nome,
            dataExpiracao
        }
    );

    if (!numero) {
        alert(
            "Este cliente não possui número de WhatsApp."
        );

        return;
    }

    let telefone =
        String(numero).replace(/\D/g, "");

    if (
        telefone.length === 10 ||
        telefone.length === 11
    ) {
        telefone = "55" + telefone;
    }

    const vencimento =
        typeof formatarData === "function"
            ? formatarData(dataExpiracao)
            : dataExpiracao;

    const mensagem =
        `${nome}\n\n` +

        `\u26A0\uFE0F Lembrete Importante!\n\n` +

        `\u2728 Continue aproveitando acesso ilimitado a:\n` +
        `\uD83D\uDCFA Canais abertos e fechados\n` +
        `\uD83C\uDFAC Filmes e séries\n` +
        `\uD83C\uDF7F Plataformas premium como: Netflix, Prime Vídeo, Disney+, HBO Max e muito mais.\n\n` +

        `\u26A0\uFE0F Evite o bloqueio automático mantendo sua assinatura em dia.\n\n` +
        `\uD83C\uDF81 Indique um amigo, após a ativação dele(a), você ganha 1 mês grátis!\n\n` +
        `\u2705 Renove agora\u2757\n\n` +
        `\uD83D\uDC60 CHAVE PIX INFINITY PAY\n` +
        `Pix E-mail: maikdias.n@gmail.com\n\n` +

        `\uD83D\uDCF1 Suporte: http://wa.me/5592920007538\n` +
        `\uD83D\uDEE0\uFE0F Contato auxiliar: http://wa.me/5592991989599`;

    const textoCodificado =
        encodeURIComponent(mensagem);

    const ehAndroid =
        /Android/i.test(navigator.userAgent);

    let url;

    if (ehAndroid) {
        // Android: tenta abrir diretamente o WhatsApp Business
        url =
            `intent://send?phone=${telefone}&text=${textoCodificado}` +
            `#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;
    } else {
        // Computador: mantém o WhatsApp Web
        url =
            `https://web.whatsapp.com/send?phone=${telefone}&text=${textoCodificado}`;
    }

    console.log(
        "Abrindo WhatsApp:",
        url
    );

    window.open(url, "_blank");
}

// =========================================================
// DISPONIBILIZAR GLOBALMENTE
// =========================================================

window.carregarVencimentos =
    carregarVencimentos;

window.enviarCobranca =
    enviarCobranca;
