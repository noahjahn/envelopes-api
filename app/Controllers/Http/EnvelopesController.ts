import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules, ParsedTypedSchema, TypedSchema } from '@ioc:Adonis/Core/Validator';

export default class EnvelopesController {
  private schema(user_uuid: string): ParsedTypedSchema<TypedSchema> {
    return schema.create({
      name: schema.string({ trim: true }, [
        rules.unique({
          table: 'envelopes',
          column: 'name',
          where: {
            user_uuid,
          },
        }),
      ]),
      planned: schema.number(),
    });
  }

  public async index({ auth, response }: HttpContextContract) {
    const user = auth.user!;
    await user.load('envelopes');
    response.ok(user.envelopes);
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const user = auth.user!;
    const payload = await request.validate({ schema: this.schema(user.uuid) });
    const envelope = await user.related('envelopes').create(payload);

    response.created(envelope);
  }

  public async show({}: HttpContextContract) {}

  public async update({ auth, request, response, params }: HttpContextContract) {
    const user = auth.user!;
    const payload = await request.validate({ schema: this.schema(user.uuid) });

    await user.load('envelopes', (query) => query.withScopes((scopes) => scopes.uuid(params.id)));

    if (user.envelopes.length === 0) {
      return response.notFound();
    }

    const envelope = user.envelopes[0];
    envelope.name = payload.name;
    envelope.planned = payload.planned;
    await envelope.save();

    response.ok(envelope);
  }

  public async destroy({ auth, response, params }: HttpContextContract) {
    const user = auth.user!;

    await user.load('envelopes', (query) => query.withScopes((scopes) => scopes.uuid(params.id)));

    if (user.envelopes.length === 0) {
      return response.notFound();
    }

    await user.envelopes[0].delete();

    return response.ok(null);
  }
}
