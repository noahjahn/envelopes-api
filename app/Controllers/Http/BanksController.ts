import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import PlaidItem from 'App/Models/PlaidItem';

export default class BanksController {
  public async index({ auth, response }: HttpContextContract) {
    await auth.use('web').user?.load('plaidItems');

    response.ok(
      auth.user?.plaidItems.map((plaidItem: PlaidItem) => {
        return {
          uuid: plaidItem.uuid,
          name: plaidItem.name,
        };
      })
    );
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
