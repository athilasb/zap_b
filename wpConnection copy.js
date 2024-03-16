
const qrcode = require('qrcode');
const terminalQR = require('qrcode-terminal');
const pino = require("pino");
const moment = require("moment-timezone");
const sessionManager  = require('./deleteSession');

const {
    default: MaiConnect,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

async function startMai(io, status) {
    const { state, saveCreds } = await useMultiFileAuthState("./Mai-SESSION");
    Mai = MaiConnect({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false, // Desabilitado aqui, pois vamos usar qrcode-terminal para exibir
        browser: ["InfoZap Pro", "", "3.O"],
        auth: state,
    });
    // Lidando com a atualização das credenciais
    Mai.ev.on("creds.update", saveCreds);
    // Lidando com a atualização da conexão
    Mai.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            // Quando o QR é recebido, exibe no terminal
            terminalQR.generate(qr, { small: true });
            qrcode.toDataURL(qr, (err, url) => {
                if (err) {
                    console.error('Erro ao gerar QR Code', err);
                } else {
                    io.emit('qr', url);
                    //console.log(url);
                }

            });
        }
        if (connection === "connecting") {
            console.log("Conectando ao WhatsApp...");
        }
        if (connection === "open") {
            console.log("Conectado ao WhatsApp.");
            status = "Conectado ao WhatsApp.";
            console.log("Bot está ativo!");
            io.emit('qr', "");
            io.emit('connection-status', 'conectado');
        }
        if (connection === "close") {
            let reason = lastDisconnect.error
                ? lastDisconnect?.error?.output.statusCode
                : 0;
            if (reason === DisconnectReason.badSession) {
                sessionManager.deleteSession()
                 startMai(io, status);
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log("Conexão fechada, reconectando....");
                status = "Conexão fechada, reconectando....";
                 startMai(io, status);
            } else if (reason === DisconnectReason.connectionLost) {
                console.log("Conexão perdida com o servidor, reconectando...");
                status = "Conexão perdida com o servidor, reconectando...";
                 startMai(io, status);
            } else if (reason === DisconnectReason.connectionReplaced) {
                status = "Dispositivo desconectado";
                sessionManager.deleteSession()
                 startMai(io, status);
            } else if (reason === DisconnectReason.loggedOut) {
                sessionManager.deleteSession()
                 startMai(io, status);
                console.log(`Dispositivo desconectado, por favor delete a sessão e escaneie novamente.`);
                status = "Dispositivo desconectado";
                // process.exit();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Reinício necessário, reiniciando...");
                status = "Reinício válido, reiniciando...";
                 startMai(io, status);
            } else if (reason === DisconnectReason.timedOut) {
                console.log("Tempo de conexão esgotado, reconectando...");
                status = "Tempo de conexão esgotado, reconectando...";
                 startMai(io, status);
            } else {
                console.log(`Motivo de desconexão desconhecido: ${reason}|${connection}`);
            }
        }

    });

    Mai.ev.on("messages.upsert", async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        //console.log(chatUpdate.type)
        if (chatUpdate.type == 'notify') {
            if (!mek.message || mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
            // Ignorar mensagens de grupos
            if (mek.key.remoteJid.endsWith('@g.us')) return;
            if (mek.key && mek.key.remoteJid === "status@broadcast") return;

            let text = mek.message.conversation || (mek.message.extendedTextMessage && mek.message.extendedTextMessage.text) || (mek.message.imageMessage && mek.message.imageMessage.caption) || (mek.message.videoMessage && mek.message.videoMessage.caption) || (mek.message.documentMessage && mek.message.documentMessage.caption) || (mek.message.audioMessage && mek.message.audioMessage.caption) || mek.message.text || "";
            if (mek.key.fromMe) {
                console.log("Mensagem enviada:", text, "PARA", mek.key.remoteJid);
            } else {
                console.log("Mensagem recebida:", text, "DE", mek.key.remoteJid);
                // Responder com a hora atual se a mensagem recebida for "horas"
                if (text.toLowerCase() === "mensagem") {
                    const timeNow = moment().tz('America/Sao_Paulo').format('HH:mm:ss');
                    const responseText = `Hora atual: ${timeNow}`;
                    // Mandar mensagem
                    await Mai.sendMessage(mek.key.remoteJid, { text: responseText });
                    // responder mensagem
                    await Mai.sendMessage(mek.key.remoteJid, { text: responseText }, { quoted: mek });
                } else if (text.toLowerCase() === "contato") {
                    // Supondo que esta seja a estrutura correta; verifique a documentação para a estrutura exata
                    const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
                        + 'VERSION:3.0\n'
                        + 'FN:miura jose de oliveira \n' // full name
                        + 'ORG:Ashoka Uni;\n' // the organization of the contact
                        + 'TEL;type=CELL;type=VOICE;waid=556294000847:+55 6298470-1346\n' // WhatsApp ID + phone number
                        + 'END:VCARD'
                    await Mai.sendMessage(
                        mek.key.remoteJid,
                        {
                            contacts: {
                                displayName: 'Jeff',
                                contacts: [{ vcard }]
                            }
                        }
                    )
                }

                
            }
        };
    });
    return Mai
}

module.exports = { 
    startMai
};
