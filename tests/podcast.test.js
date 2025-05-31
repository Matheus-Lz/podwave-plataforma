const request = require('supertest');
const app = require('../app');

describe('Criação de Podcast', () => {
  beforeEach(() => {
    global.usuarioCodigo = 1;
    global.usuarioEmail = 'teste@teste.com';

    global.banco = {
      conectarBD: jest.fn(async () => ({
        query: jest.fn(async () => []) // mock do INSERT
      }))
    };
  });

  it('deve criar um novo podcast com sucesso', async () => {
    const response = await request(app)
      .post('/criar-podcast')
      .send({
        titulo: 'Podcast de Teste',
        descricao: 'Descrição do podcast de teste',
        imagem: 'caminho/qualquer.jpg'
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/painel-criador');
  });
});
