import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import plaidClient from 'App/Services/PlaidService';

export default class BalanceController {
  public async index({ auth, response, logger }: HttpContextContract) {
    await auth.use('web').user?.load('plaidItems');

    try {
      const banksBalances = await Promise.all(
        auth.user!.plaidItems.map((plaidItem) => {
          return plaidClient.accountsBalanceGet({
            access_token: plaidItem.accessToken,
          });
        })
      );

      const balances = {
        available: 0,
        current: 0,
      };

      banksBalances.forEach((bankBalance) => {
        bankBalance.data.accounts.forEach((account) => {
          if (account.balances.available !== null) {
            balances.available += account.balances.available;
          }

          if (account.balances.current !== null) {
            balances.current += account.balances.current;
          }
        });
      });

      return response.ok(balances);
    } catch (error) {
      logger.error(error.message);
      return response.serviceUnavailable(error.message);
    }
  }
}
