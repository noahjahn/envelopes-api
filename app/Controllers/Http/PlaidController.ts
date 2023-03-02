import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema } from '@ioc:Adonis/Core/Validator';
import { CountryCode, Products } from 'plaid';
import plaidClient from 'App/Services/PlaidService';

export default class ProfilesController {
  public async linkToken({ auth, logger, response }: HttpContextContract) {
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

  public async itemAccessToken({ auth, logger, response, request }: HttpContextContract) {
    const publicTokenSchema = schema.create({
      publicToken: schema.string({ trim: true }),
      bankName: schema.string({ trim: true }),
    });

    const payload = await request.validate({ schema: publicTokenSchema });

    try {
      const itemPublicTokenExchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token: payload.publicToken,
      });

      await auth.use('web').user?.related('plaidItems').create({
        itemId: itemPublicTokenExchangeResponse.data.item_id,
        accessToken: itemPublicTokenExchangeResponse.data.access_token,
        name: payload.bankName,
      });

      return response.created();
    } catch (error) {
      logger.error(error.toString());
      logger.error(error.stack);
      return response.serviceUnavailable({ error: error.message });
    }
  }
}
