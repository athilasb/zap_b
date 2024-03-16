const db = require('../dbconnection');
const ajax = require('./ajax');

async function init(io, app, Mai, wp_connection) {
    app.post('/ajax', async (req, res) => {
        await ajax.ajax(req, res, io, Mai, wp_connection);
    });

    app.get('/user/:id', async (req, res) => {
        const { id } = req.params;
        try {
            // Note o uso de placeholders (?) e a passagem do parâmetro [id] em um array separado
            const mensagem = await db.select('whatsapp_mensagens', '*', 'id = ?', [id]);
            if (mensagem.length > 0) {
                res.json(mensagem[0]);
            } else {
                res.status(404).send('Usuário não encontrado');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao buscar o usuário');
        }
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
}

module.exports = {
    init
};