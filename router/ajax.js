let key = "CuQsFpmyKc6TY3E03EYI4CScTKWr1mHiWo8BKUPz";
const sessionManager = require('../deleteSession');
const mensage = require('../funcoes/message');

async function ajax(req, res ,io, Mai, wp_connection) {
        // Extrair número e mensagem do corpo da solicitação
        const { ajax, number, message, autorization } = req.body;
        if (autorization === key) {
            if (ajax === "send-message") {
                if (Mai) {
                    if (!message || message.trim() === "") {
                         res.status(500).json({ success: false, message: "Mensagem vazia." });
                    } else {
                        rtn =  await mensage.sendMessage(Mai, number, message);
                        res.json(rtn);
                    }
                } else {
                    res.status(500).json({ success: false, message: "Sessão não conectado." });
                }
            } else if (ajax === "qrcode") {
                if (Mai) {
                    sessionManager.deleteSession(); // Deletar a sessão após a desconexão
                    Mai = await wp_connection.startMai(io); // Reiniciar Mai após deletar a sessão
                    res.json({ success: true, message: "QRCode gerado com sucesso!" });
                }
            } else {
                res.status(400).json({ success: false, message: "Requisição inválida." });
            }
        }

}

module.exports = {
    ajax
};