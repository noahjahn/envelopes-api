import { DateTime } from 'luxon';
import { belongsTo, BelongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm';
import BaseModel from './BaseModel';
import User from './User';

export default class Envelopes extends BaseModel {
  public static table = 'envelopes';

  @column()
  public userUuid: string;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public name: string;

  @column({
    serialize(value) {
      return parseFloat(value);
    },
  })
  public planned: number;

  @computed()
  public get starting(): number {
    return 0.0;
  }

  @computed()
  public get actual(): number {
    return 0.0;
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
