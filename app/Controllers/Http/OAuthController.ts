import { AllyContract } from '@ioc:Adonis/Addons/Ally';
import { AuthContract } from '@ioc:Adonis/Addons/Auth';
import { ResponseContract } from '@ioc:Adonis/Core/Response';
import Env from '@ioc:Adonis/Core/Env';
import User from 'App/Models/User';

export default class OAuthController {
  // INFO: This is an example of how to type declare desctructured parameters
  public async index({
    ally,
    auth,
    params,
    response,
  }: {
    ally: AllyContract;
    auth: AuthContract;
    params: Record<string, any>;
    response: ResponseContract;
  }): Promise<void> {
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

  public async redirect({
    ally,
    params,
  }: {
    ally: AllyContract;
    params: Record<string, any>;
  }): Promise<void> {
    ally.use(params.provider).redirect();
  }
}
