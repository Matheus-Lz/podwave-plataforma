const request = require('supertest');
const app = require('../app');
const path = require('path');
const fs = require('fs');

describe('Exclusão de Episódio', () => {
  beforeEach(() => {
    global.usuarioEmail = 'criador@teste.com';
    global.usuarioCodigo = 1;

    global.banco = {
      conectarBD: jest.fn().mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce([{ arquivo_audio: 'audio.mp3', thumbnail: 'thumb.jpg' }]) // SELECT
          .mockResolvedValueOnce() // DELETE
      })
    };

    // Cria arquivos fake simulando uploads existentes
    const audioPath = path.join(__dirname, '../public/uploads/episodios/audio.mp3');
    const thumbPath = path.join(__dirname, '../public/uploads/thumbnails/thumb.jpg');

    fs.mkdirSync(path.dirname(audioPath), { recursive: true });
    fs.mkdirSync(path.dirname(thumbPath), { recursive: true });

    fs.writeFileSync(audioPath, 'dummy');
    fs.writeFileSync(thumbPath, 'dummy');
  });

  it('deve excluir episódio com sucesso', async () => {
    const response = await request(app).delete('/painel-criador/excluir-episodio/1');
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/painel-criador/meus-episodios');
  });
});
