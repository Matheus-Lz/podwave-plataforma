// tests/auth.test.js
const request = require('supertest');
const app = require('../app');

describe('Autenticação', () => {
  beforeEach(() => {
    global.banco = {
      buscarUsuario: jest.fn(({ email, senha }) => {
        if (email === 'teste@teste.com' && senha === '123456') {
          return { id_usuario: 1, email, tipo: 'admin' };
        }
        return null;
      }),
      conectarBD: jest.fn(() => ({
        query: jest.fn().mockResolvedValue([[{ id_podcast: 1, titulo: 'Meu Podcast' }]])
      }))
    };
  });

  it('deve fazer login com sucesso', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'teste@teste.com', senha: '123456' });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/painel-criador');
  });

  it('deve falhar com credenciais inválidas', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'email@errado.com', senha: 'senhaerrada' });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/');
  });
});
