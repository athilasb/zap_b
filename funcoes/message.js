async function sendMessage(Mai,number,message) {
    try {
        const sendMessageResponse = await Mai.sendMessage(number + "@s.whatsapp.net", { text: message });
        // Verificar se a mensagem foi enviada com sucesso e responder ao frontend
        if (sendMessageResponse) {
            return { success: true, message: "Mensagem enviada com sucesso!" };
        } else {
            return { success: false, message: "Falha ao enviar mensagem." };
        }
    } catch (error) {
        return { success: false, message: "Erro ao enviar mensagem." };
    }

}

module.exports = {
    sendMessage
};