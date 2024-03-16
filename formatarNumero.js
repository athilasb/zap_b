function formatarNumero(numero) {
    const numeroCompleto = numero.split('@')[0];
    // Adiciona o '9' se necessário
    const numeroCom9 = numeroCompleto.startsWith('55') && numeroCompleto.length === 12 ? numeroCompleto.slice(0, 4) + '9' + numeroCompleto.slice(4) : numeroCompleto;
    // Remove o código do país '55'
    const numeroSemCodigoPais = numeroCom9.startsWith('55') ? numeroCom9.slice(2) : numeroCom9;
    return numeroSemCodigoPais;
}

module.exports = { 
    formatarNumero 
};
