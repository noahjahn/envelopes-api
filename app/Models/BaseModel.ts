import { BaseModel as LucidBaseModel, column } from '@ioc:Adonis/Lucid/Orm';
import { v4 as uuidv4 } from 'uuid';

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
}
