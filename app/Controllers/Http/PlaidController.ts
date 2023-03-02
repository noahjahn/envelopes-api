import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema } from '@ioc:Adonis/Core/Validator';
import plaidClient, {
  linkTokenCreateRequestWithoutUserAndProducts,
  products,
} from 'App/Services/PlaidService';

export default class ProfilesController {
  public async linkToken({ auth, logger, response }: HttpContextContract) {
    try {
      if (!auth.use('web').user || auth.use('web').user?.uuid === '') {
        return response.internalServerError({
          error: 'User uuid is not valid',
        });
      }

      const plaidLinkTokenResponse = await plaidClient.linkTokenCreate({
        ...linkTokenCreateRequestWithoutUserAndProducts,
        user: {
          client_user_id: auth.use('web').user!.uuid,
        },
        products,
      });
      return response.ok(plaidLinkTokenResponse.data);
    } catch (error) {
      logger.error(error.message);
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
      logger.error(error.message);
      return response.serviceUnavailable({ error: error.message });
    }
  }
}
