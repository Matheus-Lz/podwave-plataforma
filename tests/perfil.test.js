const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app');

describe('Edição de Perfil do Podcast', () => {
  beforeEach(() => {
    global.usuarioCodigo = 1;
    global.usuarioEmail = 'teste@teste.com';

    global.banco = {
      conectarBD: jest.fn(async () => ({
        query: jest.fn(async (sql, params) => {
          if (sql.includes('SELECT * FROM podcasts')) {
            return [[{
              id_usuario: 1,
              titulo: 'Podcast Teste',
              descricao: 'Descrição original',
              imagem: 'imagem-original.jpg'
            }]];
          }
          if (sql.includes('UPDATE podcasts SET')) {
            return []; // mock do update
          }
          return [[]];
        })
      }))
    };
  });

  it('deve editar o perfil com nova descrição e imagem', async () => {
    const response = await request(app)
      .post('/painel-criador/editar-perfil')
      .attach('imagem', path.join(__dirname, 'mocks/ImagemTeste.jpg'))
      .field('descricao', 'Nova descrição editada');

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Perfil atualizado com sucesso!');
  });
});
