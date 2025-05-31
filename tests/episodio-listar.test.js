// tests/episodio-listar.test.js
const request = require('supertest');
const app = require('../app');

describe('Listagem de Episódios', () => {
  beforeEach(() => {
    global.usuarioCodigo = 1;
    global.usuarioEmail = 'teste@teste.com'; // Necessário para passar na verificação de login

    global.banco = {
      conectarBD: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValueOnce([[{ id_podcast: 1 }]])
      }),
      listarEpisodiosDoPodcast: jest.fn().mockResolvedValue([
        { id_episodio: 1, titulo: 'Episódio 1', descricao: 'Teste 1', thumbnail: 'thumb.jpg' }
      ])
    };
  });

  it('deve listar episódios do criador com sucesso', async () => {
    const response = await request(app).get('/painel-criador/meus-episodios');

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Meus Episódios');
    expect(response.text).toContain('Episódio 1');
  });
});
