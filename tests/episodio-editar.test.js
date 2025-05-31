const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app');

describe('Edição de Episódio', () => {
  beforeEach(() => {
    global.usuarioEmail = 'criador@teste.com';
    global.usuarioCodigo = 1;

    global.banco = {
      conectarBD: jest.fn().mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce([]) // Primeiro SELECT antigo thumbnail (mock)
          .mockResolvedValueOnce()   // UPDATE
      })
    };

    // Garante existência de imagem dummy
    const dummy = path.join(__dirname, 'mocks', 'ImagemTeste.jpg');
    if (!fs.existsSync(dummy)) {
      fs.writeFileSync(dummy, Buffer.alloc(10));
    }
  });

  it('deve editar episódio com sucesso', async () => {
    const response = await request(app)
      .put('/painel-criador/editar-episodio/1?_method=PUT')
      .field('titulo', 'Novo Título')
      .field('descricao', 'Nova descrição')
      .field('thumbnailAntiga', 'thumb_antiga.jpg')
      .attach('thumbnail', path.join(__dirname, 'mocks', 'ImagemTeste.jpg'));

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/painel-criador/meus-episodios');
  });
});
