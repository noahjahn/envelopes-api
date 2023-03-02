import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'plaid_items';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('update_required').defaultTo(false).notNullable();
      table.string('update_required_reason').nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('update_required_reason');
      table.dropColumn('update_required');
    });
  }
}
