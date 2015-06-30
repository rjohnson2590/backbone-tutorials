'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('grocery', function(table) {
    table.increments('id').primary();
    table.string('Item');
    table.string('Price');
    table.string('quantity');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('grocery');
};