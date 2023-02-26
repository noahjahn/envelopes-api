import type { AuthContract } from '@ioc:Adonis/Addons/Auth';

export default class ProfilesController {
  public async me({ auth }: { auth: AuthContract }) {
    return auth.use('web').user;
  }
}
