import { DateTime } from 'luxon';
import { belongsTo, BelongsTo, column, scope } from '@ioc:Adonis/Lucid/Orm';
import BaseModel from './BaseModel';
import User from './User';

export default class PlaidItem extends BaseModel {
  public static table = 'banks';

  @column()
  public userUuid: string;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public itemId: string;

  @column()
  public accessToken: string;

  @column()
  public name: string;

  @column()
  public updateRequired: boolean;

  @column()
  public updateRequiredReason: string | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  public static clientSide = scope((query) => {
    query.select(['uuid', 'name', 'updateRequired', 'updateRequiredReason']);
  });
}
