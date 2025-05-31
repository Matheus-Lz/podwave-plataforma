
# 🎧 PodWave – Plataforma de Podcasts

PodWave é uma plataforma de publicação e escuta de podcasts. O sistema permite que criadores de conteúdo possam enviar episódios e gerenciar seus programas, enquanto usuários ouvintes podem explorar os conteúdos disponíveis.

---
## 🧑‍💻 Autores

- Matheus Luiz da Silva, Lucas Honorato do Santos, Gustavo Lipinski

## 📋 Funcionalidades Disponíveis

### 👥 Cadastro e Login
- Cadastro de usuários comuns (ouvintes) ou criadores de conteúdo (admin).
- Login com redirecionamento de acordo com o tipo de usuário.

### 🧑‍💼 Painel do Criador
- Criação do podcast com título, descrição e imagem de perfil.
- Envio de novos episódios com título, descrição, áudio e thumbnail.
- Edição inline de episódios (título, descrição e imagem).
- Exclusão de episódios.
- Edição do perfil do podcast (descrição e imagem).

### 🎙 Painel do Ouvinte
- Página de exploração dos episódios disponíveis.

---

## 🔁 Fluxo de Uso (até o momento)

- Para testar as funcionalidades como administrador/criador de conteúdo:

1. Acesse a tela de cadastro (`/cadastro`) e preencha os dados.
2. Marque a opção **"Sou Criador de Conteúdo"** para que o usuário seja registrado como `admin`.
3. Após o cadastro, faça o login com o e-mail e senha utilizados.
4. No primeiro login de um admin, será exibida automaticamente a tela para **criar um podcast** (preencha o título, descrição e imagem - opcional).
5. Após criar o podcast, você será redirecionado ao **painel do criador**, onde poderá:
   - Acessar a tela de **enviar episódio**;
   - **Visualizar, editar ou excluir episódios** já cadastrados;
   - **Ouvir os episódios** clicando na thumbnail do episódio;
   - Acessar a tela de **editar perfil do podcast** (alterar descrição e imagem).

- Para testar como ouvinte (usuário comum):

1. Acesse a tela de cadastro (`/cadastro`) e **não marque** a opção de criador de conteúdo.
2. Após o login, o usuário será redirecionado para a página `/browse`, onde futuramente será possível explorar episódios e podcasts disponíveis.

## 🧪 Testes Unitários

- Utiliza **Jest** e **Supertest**
- Cobertura próxima de 80% com testes de:
  - Autenticação
  - Cadastro
  - Envio, listagem, edição e exclusão de episódios
  - Edição de perfil e criação de podcast

---

## ⚙️ Como Executar o Projeto

### 📁 Pré-requisitos
- Node.js e npm instalados
- MySQL com banco de dados configurado
- Clonar este repositório e navegar até a pasta do projeto

---

## 🛢 Banco de Dados

- O arquivo `podwave.sql` está localizado na pasta `/database`.
- Para importar:

1. Abra o phpMyAdmin ou o seu gerenciador MySQL/MariaDB preferido.
2. Crie um banco com o nome `podwave`.
3. Importe o arquivo `podwave.sql`.

⚠️ **Certifique-se de que as credenciais de conexão no arquivo `banco.js` estejam corretas conforme sua máquina.**


### 📦 Instalar dependências
```bash
npm install
```

### 🚀 Rodar o servidor
```bash
npm start
```

> O servidor será iniciado a partir do `./bin/www` via Express Generator

---

## 🧪 Executar os Testes

### Criar estrutura de testes
Já deve haver a pasta `tests/` com os arquivos:

- `auth.test.js`
- `cadastro.test.js`
- `episodio.test.js`
- `episodio-listar.test.js`
- `episodio-editar.test.js`
- `episodio-excluir.test.js`
- `perfil.test.js`
- `podcast.test.js`

### Comando para executar os testes
```bash
npm test
```

### Comando alternativo
```bash
npx jest
```

---

## 🛠 Tecnologias Utilizadas

- Node.js + Express
- EJS (Template Engine)
- MySQL (via XAMPP)
- Multer e Sharp (upload e compressão de arquivos)
- Jest e Supertest (testes automatizados)

---


