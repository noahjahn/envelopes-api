import PlaidItem from 'App/Models/PlaidItem';
import { ResponseContract } from '@ioc:Adonis/Core/Response';
import { AuthContract } from '@ioc:Adonis/Addons/Auth';

export default class BanksController {
  public async index({ auth, response }: { auth: AuthContract; response: ResponseContract }) {
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
}
