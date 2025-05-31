const mysql = require('mysql2/promise');

async function conectarBD() {
    if (global.conexao && global.conexao.state !== 'disconnected') {
        return global.conexao;
    }

    const conexao = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'podwave'
    });

    global.conexao = conexao;
    return global.conexao;
}

async function buscarUsuario(usuario) {
    const conexao = await conectarBD();
    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?;";
    const [rows] = await conexao.query(sql, [usuario.email, usuario.senha]);

    return rows.length > 0 ? rows[0] : null;
}

async function buscarPerfis(usuarioCodigo) {
    const conexao = await conectarBD();
    const sql = "SELECT * FROM perfis WHERE usucodigo = ?;";
    const [rows] = await conexao.query(sql, [usuarioCodigo]);

    return rows;
}

async function buscarPerfil(perfilCodigo) {
    const conexao = await conectarBD();
    const sql = "SELECT * FROM perfis WHERE percodigo = ?;";
    const [rows] = await conexao.query(sql, [perfilCodigo]);

    return rows[0];
}

async function cadastrarPodcast(podcast, id_usuario) {
    const conexao = await conectarBD();
    const sql = "INSERT INTO podcasts (titulo, descricao, id_usuario) VALUES (?, ?, ?);";
    await conexao.query(sql, [podcast.titulo, podcast.descricao, id_usuario]);
}

async function cadastrarEpisodio(episodio, idPodcast) {
    const conexao = await conectarBD();
    const sql = `
    INSERT INTO episodios (titulo, descricao, arquivo_audio, id_podcast) 
    VALUES (?, ?, ?, ?);
  `;
    const { titulo, descricao, arquivo_audio } = episodio;
    await conexao.query(sql, [titulo, descricao, arquivo_audio, idPodcast]);
}

async function editarEpisodio(episodio, idEpisodio) {
    const conexao = await conectarBD();
    const sql = `
    UPDATE episodios 
    SET titulo = ?, descricao = ?, arquivo_audio = ?
    WHERE id_episodio = ?;
  `;
    const { titulo, descricao, arquivo_audio } = episodio;
    await conexao.query(sql, [titulo, descricao, arquivo_audio, idEpisodio]);
}

async function deletarEpisodio(idEpisodio) {
    const conexao = await conectarBD();
    const sql = `DELETE FROM episodios WHERE id_episodio = ?;`;
    await conexao.query(sql, [idEpisodio]);
}

async function listarEpisodiosDoPodcast(idPodcast) {
    const conexao = await conectarBD();
    const sql = `SELECT * FROM episodios WHERE id_podcast = ? ORDER BY id_episodio DESC;`;
    const [rows] = await conexao.query(sql, [idPodcast]);
    return rows;
}
module.exports = {
    conectarBD,
    buscarUsuario,
    buscarPerfis,
    buscarPerfil,
    cadastrarPodcast,
    cadastrarEpisodio,
    editarEpisodio,
    deletarEpisodio,
    listarEpisodiosDoPodcast,
};
