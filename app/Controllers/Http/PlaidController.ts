import { ResponseContract } from '@ioc:Adonis/Core/Response';
import { LoggerContract } from '@ioc:Adonis/Core/Logger';
import { AuthContract } from '@ioc:Adonis/Addons/Auth';

import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export default class ProfilesController {
  public async linkToken({
    auth,
    logger,
    response,
  }: {
    auth: AuthContract;
    logger: LoggerContract;
    response: ResponseContract;
  }) {
    if (
      !('PLAID_CLIENT_ID' in process.env) ||
      process.env.PLAID_CLIENT_ID === undefined ||
      process.env.PLAID_CLIENT_ID === '' ||
      process.env.PLAID_CLIENT_ID === null ||
      !('PLAID_SECRET' in process.env) ||
      process.env.PLAID_SECRET === undefined ||
      process.env.PLAID_SECRET === '' ||
      process.env.PLAID_SECRET === null
    ) {
      return response.internalServerError({ error: 'Plaid is not configured correctly' });
    }
    try {
      if (!auth.use('web').user || auth.use('web').user?.uuid === '') {
        return response.internalServerError({
          error: 'User uuid is not valid',
        });
      }

      const plaidLinkTokenResponse = await plaidClient.linkTokenCreate({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        client_name: 'Envelopes',
        language: 'en',
        country_codes: [CountryCode.Us],
        user: {
          client_user_id: auth.use('web').user!.uuid,
        },
        products: [Products.Auth, Products.Transactions],
      });
      return response.ok(plaidLinkTokenResponse.data);
    } catch (error) {
      logger.error(error.toString());
      logger.error(error.stack);
      return response.serviceUnavailable({ error: error.message });
    }
  }
}
