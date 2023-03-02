import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import PlaidItem from 'App/Models/PlaidItem';
import { schema } from '@ioc:Adonis/Core/Validator';
import plaidClient from 'App/Services/PlaidService';

export default class BanksController {
  public async index({ auth, response }: HttpContextContract) {
    await auth.use('web').user?.load('plaidItems');

    response.ok(
      auth.user?.plaidItems.map((plaidItem: PlaidItem) => {
        return {
          uuid: plaidItem.uuid,
          name: plaidItem.name,
          updateRequired: plaidItem.updateRequired,
          updateRequiredReason: plaidItem.updateRequiredReason,
        };
      })
    );
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async update({ auth, params, response, request }: HttpContextContract) {
    const bankSchema = schema.create({
      name: schema.string({ trim: true }),
    });

    const payload = await request.validate({ schema: bankSchema });

    await auth.use('web').user?.load('plaidItems', (plaidItemsQuery) => {
      plaidItemsQuery.where('uuid', params.id);
      plaidItemsQuery.limit(1);
    });

    if (auth.user?.plaidItems.length === 0) {
      return response.notFound();
    }

    auth.user!.plaidItems[0].name = payload.name;
    await auth.user!.plaidItems[0].save();

    return response.ok(
      auth.user!.plaidItems.map((plaidItem: PlaidItem) => {
        return {
          uuid: plaidItem.uuid,
          name: plaidItem.name,
        };
      })[0]
    );
  }

  public async destroy({ auth, params, response, logger }: HttpContextContract) {
    await auth.use('web').user?.load('plaidItems', (plaidItemsQuery) => {
      plaidItemsQuery.where('uuid', params.id);
      plaidItemsQuery.limit(1);
    });

    if (auth.user?.plaidItems.length === 0) {
      return response.notFound();
    }

    try {
      await plaidClient.itemRemove({
        access_token: auth.user!.plaidItems[0].accessToken,
      });
    } catch (error) {
      logger.error(error.message);
      return response.serviceUnavailable(error.message);
    }

    await auth.user!.plaidItems[0].delete();

    return response.ok(null);
  }
}
