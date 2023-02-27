import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'plaid_items';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid').primary();

      table.string('item_id', 255).unique();
      table.string('access_token', 255);
      table.uuid('user_uuid').references('users.uuid');

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
