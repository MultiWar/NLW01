import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('tblItens').insert([
        {nome: 'Lâmpadas', imagem: 'lampadas.svg'},
        {nome: 'Pilhas e Baterias', imagem: 'baterias.svg'},
        {nome: 'Papéis e Papelão', imagem: 'papeis-papelao.svg'},
        {nome: 'Resíduos Eletrônicos', imagem: 'eletronicos.svg'},
        {nome: 'Resíduos Orgânicos', imagem: 'organicos.svg'},
        {nome: 'Óleo de Cozinha', imagem: 'oleo.svg'},
    ])
}