import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema } from '@ioc:Adonis/Core/Validator';

export default class EnvelopesController {
  public async index({ auth, response }: HttpContextContract) {
    await auth.use('web').user?.load('envelopes');
    response.ok(auth.user?.envelopes);
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const envelopeSchema = schema.create({
      name: schema.string({ trim: true }),
      planned: schema.number(),
    });

    const payload = await request.validate({ schema: envelopeSchema });
    const envelope = await auth.use('web').user?.related('envelopes').create(payload);

    response.created(envelope);
  }

  public async show({}: HttpContextContract) {}

  public async update({ auth, request, response, params }: HttpContextContract) {
    const envelopeSchema = schema.create({
      name: schema.string({ trim: true }),
      planned: schema.number(),
    });

    const payload = await request.validate({ schema: envelopeSchema });

    await auth.use('web').user?.load('envelopes', (envelopesQuery) => {
      envelopesQuery.where('uuid', params.id);
      envelopesQuery.limit(1);
    });

    if (auth.user!.envelopes.length === 0) {
      return response.notFound();
    }

    auth.user!.envelopes[0].name = payload.name;
    auth.user!.envelopes[0].planned = payload.planned;
    await auth.user!.envelopes[0].save();
    response.ok(auth.user!.envelopes[0]);
  }

  public async destroy({ auth, response, params }: HttpContextContract) {
    await auth.use('web').user?.load('envelopes', (envelopesQuery) => {
      envelopesQuery.where('uuid', params.id);
      envelopesQuery.limit(1);
    });

    if (auth.user?.envelopes.length === 0) {
      return response.notFound();
    }

    await auth.user!.envelopes[0].delete();

    return response.ok(null);
  }
}
