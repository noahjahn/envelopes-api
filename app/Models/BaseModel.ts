import {
  BaseModel as LucidBaseModel,
  column,
  scope,
  ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm';
import { v4 as uuidv4 } from 'uuid';

type Builder = ModelQueryBuilderContract<typeof BaseModel>;

export default class BaseModel extends LucidBaseModel {
  public static selfAssignPrimaryKey = true;
  public static primaryKey = 'uuid';
  public static incrementing = false;

  @column({ isPrimary: true })
  public uuid: string;

  public static boot() {
    if (this.booted) {
      return;
    }

    super.boot();
    this.before('create', (baseModel: BaseModel) => {
      baseModel.uuid = uuidv4();
    });
  }

  public static oneWhere = scope((query, column: string, value: any) => {
    query.where(column, value);
    query.limit(1);
  });

  public static uuid = scope((query: Builder, uuid: string) => {
    query.withScopes((scopes) => scopes.oneWhere('uuid', uuid));
  });
}
