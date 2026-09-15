console.log("UTILS CARREGADO");


// ==========================
// FORMATAR DATA
// ==========================

function formatarData(data){

    if(!data)
        return "-";


    const partes =
    data.split("-");


    if(partes.length !== 3)
        return data;


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}