import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
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
}
