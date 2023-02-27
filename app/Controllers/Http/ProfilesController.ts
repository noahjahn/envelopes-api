import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class ProfilesController {
  public async me({ auth }: HttpContextContract) {
    return auth.use('web').user;
  }
}
