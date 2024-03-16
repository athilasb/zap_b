const fs = require("fs");

function deleteSession() {
    const sessionDir = 'Mai-SESSION';
    if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log("Pasta da sessão deletada.");
    }
}

module.exports = { 
    deleteSession 
};
