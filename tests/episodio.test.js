const request = require('supertest');
const path = require('path');
const app = require('../app');

describe('Envio de Episódio', () => {
  beforeEach(() => {
    global.banco = {
      conectarBD: jest.fn().mockResolvedValue({
        query: jest.fn().mockImplementation((sql) => {
          if (sql.includes('SELECT id_podcast')) {
            return [[{ id_podcast: 1 }]];
          }
          return [[]];
        })
      })
    };

    global.usuarioEmail = 'criador@teste.com';
    global.usuarioCodigo = 1;
  });

  it('deve enviar um episódio com sucesso', async () => {
    const response = await request(app)
      .post('/painel-criador/enviar-episodio')
      .field('titulo', 'Episódio Teste')
      .field('descricao', 'Descrição do episódio')
      .attach('arquivo_audio', path.join(__dirname, 'mocks/AudioTeste.mp3'))
      .attach('thumbnail', path.join(__dirname, 'mocks/ImagemTeste.jpg'));

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Episódio enviado com sucesso');
  });
});
