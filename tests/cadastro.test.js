// tests/cadastro.test.js
const request = require('supertest');
const app = require('../app');

describe('Cadastro de Usuário', () => {
  beforeEach(() => {
    global.banco = {
      conectarBD: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue([{}])
      })
    };
  });

  it('deve cadastrar um novo usuário como admin com sucesso', async () => {
    const response = await request(app)
      .post('/cadastro')
      .send({
        nome: 'Novo Usuário',
        email: 'novo@teste.com',
        senha: '123456',
        souCriador: '1'
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/');
  });

  it('deve cadastrar um novo usuário como user (ouvinte)', async () => {
    const response = await request(app)
      .post('/cadastro')
      .send({
        nome: 'Outro Usuário',
        email: 'ouvinte@teste.com',
        senha: '123456',
        souCriador: '0'
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/');
  });
});
