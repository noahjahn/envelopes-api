import { DateTime } from 'luxon';
import { column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm';
import BaseModel from './BaseModel';
import PlaidItem from './PlaidItem';
import Envelope from './Envelope';

export default class User extends BaseModel {
  public static table = 'users';

  @column()
  public email: string;

  @column()
  public name: string;

  @column()
  public accessToken: string;

  @hasMany(() => PlaidItem)
  public plaidItems: HasMany<typeof PlaidItem>;

  @hasMany(() => Envelope)
  public envelopes: HasMany<typeof Envelope>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
