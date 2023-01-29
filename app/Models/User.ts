import { DateTime } from 'luxon';
import { column } from '@ioc:Adonis/Lucid/Orm';
import BaseModel from './BaseModel';

export default class User extends BaseModel {
  public static table = 'users';

  @column()
  public email: string;

  @column()
  public name: string;

  @column()
  public accessToken: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
