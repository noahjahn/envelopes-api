import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'banks';
  protected oldTableName = 'plaid_items';

  public async up() {
    this.schema.renameTable(this.oldTableName, this.tableName);
  }

  public async down() {
    this.schema.renameTable(this.tableName, this.oldTableName);
  }
}
