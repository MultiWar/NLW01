import Knex from "knex";

export async function up(knex: Knex) {
    return knex.schema.createTable('tblItens', table => {
        table.increments('id').primary();
        table.string('nome').notNullable();
        table.string('imagem').notNullable();
    });
};

export async function down(knex: Knex) {
    return knex.schema.dropTable('tblItens');
}