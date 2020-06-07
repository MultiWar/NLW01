import Knex from "knex";

export async function up(knex: Knex) {
    return knex.schema.createTable('tblPonto_Itens', table => {
        table.integer('pontoDeColeta_id').notNullable().references('id').inTable('tblPontosDeColeta');
        table.integer('item_id').notNullable().references('id').inTable('tblItens');
    });
};

export async function down(knex: Knex) {
    return knex.schema.dropTable('tblPonto_Itens');
}