import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Env from '@ioc:Adonis/Core/Env';
import User from 'App/Models/User';

export default class OAuthController {
  public async callback({ ally, auth, params, response }: HttpContextContract): Promise<void> {
    const oauthProvider = ally.use(params.provider);

    oauthProvider.loadState();

    if (oauthProvider.accessDenied() || oauthProvider.stateMisMatch()) {
      response.unauthorized();
      return;
    }

    if (oauthProvider.stateMisMatch()) {
      response.unauthorized();
      return;
    }

    if (oauthProvider.hasError()) {
      response.serviceUnavailable({ error: oauthProvider.getError() });
      return;
    }

    const oauthUser = await oauthProvider.user();

    const user = await User.firstOrCreate(
      {
        email: oauthUser.email,
      },
      {
        name: oauthUser.name,
        accessToken: oauthUser.token.token,
      }
    );

    await auth.use('web').login(user);

    response.redirect(Env.get('FRONTEND_URL'));
  }

  public async redirect({ ally, params }: HttpContextContract): Promise<void> {
    ally.use(params.provider).redirect();
  }
}
