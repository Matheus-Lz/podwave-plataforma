const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const tempDir = path.join(__dirname, '../temp');
const audioDir = 'public/uploads/episodios';
const thumbDir = 'public/uploads/thumbnails';

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, file, cb) => cb(null, tempDir),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

function verificarLogin(res) {
  if (!global.usuarioEmail) {
    res.redirect('/');
    return false;
  }
  return true;
}

router.get('/', (req, res) => {
  if (global.usuarioEmail) return res.redirect('/browse');
  res.render('login', { titulo: 'PodWave – Login' });
});

router.get('/cadastro', (req, res) => {
  res.render('cadastro', { titulo: 'PodWave – Cadastro' });
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await global.banco.buscarUsuario({ email, senha });
  if (!usuario) return res.redirect('/');

  global.usuarioCodigo = usuario.id_usuario;
  global.usuarioEmail = usuario.email;

  const conexao = await global.banco.conectarBD();
  const [podcasts] = await conexao.query('SELECT * FROM podcasts WHERE id_usuario = ?', [global.usuarioCodigo]);

  if (usuario.tipo === 'admin') {
    return podcasts.length === 0 ? res.redirect('/criar-podcast') : res.redirect('/painel-criador');
  }

  res.redirect('/browse');
});

router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, souCriador } = req.body;
  const tipo = souCriador === '1' ? 'admin' : 'user';
  const conexao = await global.banco.conectarBD();
  await conexao.query('INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)', [nome, email, senha, tipo]);
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  global.usuarioCodigo = null;
  global.usuarioEmail = null;
  global.perfil = null;
  res.redirect('/');
});

router.get('/criar-podcast', (req, res) => {
  if (!verificarLogin(res)) return;
  res.render('criarPodcast', { titulo: 'Criar Podcast' });
});

router.post('/criar-podcast', async (req, res) => {
  if (!verificarLogin(res)) return;
  const { titulo, descricao, imagem } = req.body;
  const conexao = await global.banco.conectarBD();
  await conexao.query('INSERT INTO podcasts (titulo, descricao, imagem, id_usuario) VALUES (?, ?, ?, ?)', [titulo, descricao, imagem, global.usuarioCodigo]);
  res.redirect('/painel-criador');
});

router.get('/painel-criador', async (req, res) => {
  if (!verificarLogin(res)) return;
  const conexao = await global.banco.conectarBD();
  const [podcast] = await conexao.query('SELECT titulo FROM podcasts WHERE id_usuario = ? LIMIT 1', [global.usuarioCodigo]);
  const nomePodcast = podcast.length > 0 ? podcast[0].titulo : 'Criador';
  res.render('painelCriador', { titulo: 'Painel do Criador', nomePodcast });
});

router.get('/painel-criador/editar-perfil', async (req, res) => {
  if (!verificarLogin(res)) return;
  const conexao = await global.banco.conectarBD();
  const [dados] = await conexao.query('SELECT * FROM podcasts WHERE id_usuario = ?', [global.usuarioCodigo]);
  if (dados.length === 0) return res.redirect('/criar-podcast');
  res.render('editarPerfil', { titulo: 'Editar Perfil', podcast: dados[0], mensagem: null });
});

router.post('/painel-criador/editar-perfil', upload.single('imagem'), async (req, res) => {
  if (!verificarLogin(res)) return;
  const { descricao } = req.body;
  const conexao = await global.banco.conectarBD();
  let imagemPath = null;

  if (req.file) {
    const finalThumbName = Date.now() + '.jpg';
    const dest = path.join(thumbDir, finalThumbName);
    await sharp(req.file.path).resize(300, 300, { fit: 'cover' }).jpeg({ quality: 80 }).toFile(dest);
    await fs.promises.unlink(req.file.path).catch(() => {});
    imagemPath = '/uploads/thumbnails/' + finalThumbName;
  }

  const [podcast] = await conexao.query('SELECT * FROM podcasts WHERE id_usuario = ?', [global.usuarioCodigo]);
  if (podcast.length > 0) {
    await conexao.query('UPDATE podcasts SET descricao = ?, imagem = ? WHERE id_usuario = ?', [
      descricao,
      imagemPath || podcast[0].imagem,
      global.usuarioCodigo
    ]);
  }

  const [dadosAtualizados] = await conexao.query('SELECT * FROM podcasts WHERE id_usuario = ?', [global.usuarioCodigo]);
  res.render('editarPerfil', { titulo: 'Editar Perfil', podcast: dadosAtualizados[0], mensagem: 'Perfil atualizado com sucesso!' });
});

router.get('/painel-criador/enviar-episodio', (req, res) => {
  if (!verificarLogin(res)) return;
  res.render('enviarEpisodio', { titulo: 'Enviar Episódio', mensagem: null });
});

router.post('/painel-criador/enviar-episodio', upload.fields([
  { name: 'arquivo_audio' },
  { name: 'thumbnail' }
]), async (req, res) => {
  if (!verificarLogin(res)) return;
  try {
    const { titulo, descricao } = req.body;
    const audioFile = req.files['arquivo_audio']?.[0];
    const thumbFile = req.files['thumbnail']?.[0];
    if (!audioFile || !thumbFile) {
      if (audioFile) fs.unlinkSync(audioFile.path);
      if (thumbFile) fs.unlinkSync(thumbFile.path);
      return res.render('enviarEpisodio', { titulo: 'Enviar Episódio', mensagem: 'Erro ao enviar arquivos. Verifique os campos.' });
    }
    const finalAudioName = audioFile.filename;
    const finalThumbName = Date.now() + '.jpg';
    const audioDest = path.join(audioDir, finalAudioName);
    const thumbDest = path.join(thumbDir, finalThumbName);
    fs.renameSync(audioFile.path, audioDest);
    await sharp(thumbFile.path).resize(300, 300, { fit: 'cover' }).jpeg({ quality: 80 }).toFile(thumbDest);
    await fs.promises.unlink(thumbFile.path).catch(err => console.warn('Não foi possível remover thumbnail temporário:', err.message));
    const conexao = await global.banco.conectarBD();
    const [podcasts] = await conexao.query('SELECT id_podcast FROM podcasts WHERE id_usuario = ?', [global.usuarioCodigo]);
    if (podcasts.length === 0) {
      fs.unlinkSync(audioDest);
      fs.unlinkSync(thumbDest);
      return res.redirect('/criar-podcast');
    }
    await conexao.query('INSERT INTO episodios (id_podcast, titulo, descricao, arquivo_audio, thumbnail) VALUES (?, ?, ?, ?, ?)', [podcasts[0].id_podcast, titulo, descricao, finalAudioName, finalThumbName]);
    res.render('enviarEpisodio', { titulo: 'Enviar Episódio', mensagem: 'Episódio enviado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).render('enviarEpisodio', { titulo: 'Enviar Episódio', mensagem: 'Erro ao enviar episódio. Tente novamente.' });
  }
});

router.get('/painel-criador/meus-episodios', async (req, res) => {
  if (!verificarLogin(res)) return;
  const conexao = await global.banco.conectarBD();
  const [podcasts] = await conexao.query('SELECT id_podcast FROM podcasts WHERE id_usuario = ?', [global.usuarioCodigo]);
  if (podcasts.length === 0) return res.redirect('/criar-podcast');
  const episodios = await global.banco.listarEpisodiosDoPodcast(podcasts[0].id_podcast);
  res.render('listarEpisodios', { titulo: 'Meus Episódios', episodios });
});

router.put('/painel-criador/editar-episodio/:id', upload.single('thumbnail'), async (req, res) => {
  if (!verificarLogin(res)) return;
  const { titulo, descricao, thumbnailAntiga } = req.body;
  const conexao = await global.banco.conectarBD();
  let nomeThumbnail = thumbnailAntiga;
  if (req.file) {
    const novaThumb = Date.now() + '.jpg';
    const thumbDest = path.join(thumbDir, novaThumb);
    await sharp(req.file.path).resize(300, 300, { fit: 'cover' }).jpeg({ quality: 80 }).toFile(thumbDest);
    await fs.promises.unlink(req.file.path).catch(() => {});
    const caminhoAntigo = path.join(thumbDir, thumbnailAntiga);
    if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
    nomeThumbnail = novaThumb;
  }
  await conexao.query('UPDATE episodios SET titulo = ?, descricao = ?, thumbnail = ? WHERE id_episodio = ?', [titulo, descricao, nomeThumbnail, req.params.id]);
  res.redirect('/painel-criador/meus-episodios');
});

router.delete('/painel-criador/excluir-episodio/:id', async (req, res) => {
  if (!verificarLogin(res)) return;
  const conexao = await global.banco.conectarBD();
  const [episodio] = await conexao.query('SELECT arquivo_audio, thumbnail FROM episodios WHERE id_episodio = ?', [req.params.id]);
  if (episodio.length > 0) {
    const audioPath = path.join(audioDir, episodio[0].arquivo_audio);
    const thumbPath = path.join(thumbDir, episodio[0].thumbnail);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
  }
  await conexao.query('DELETE FROM episodios WHERE id_episodio = ?', [req.params.id]);
  res.redirect('/painel-criador/meus-episodios');
});

router.get('/browse', (req, res) => {
  if (!verificarLogin(res)) return;
  res.render('browse', { titulo: 'PodWave – Explorar Podcasts', imagem: global.perfil?.perfoto });
});

module.exports = router;
