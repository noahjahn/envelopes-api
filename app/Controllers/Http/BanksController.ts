import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules, ParsedTypedSchema, TypedSchema } from '@ioc:Adonis/Core/Validator';
import plaidClient, {
  linkTokenCreateRequestWithoutUserAndProducts,
} from 'App/Services/PlaidService';

export default class BanksController {
  private typedSchema(user_uuid: string): TypedSchema {
    // TODO: maybe having a unique rule here doesn't make sense, the bank name comes from plaid so if someone has multiple accounts at the same bank, it won't get added!
    return {
      name: schema.string({ trim: true }, [
        rules.unique({
          table: 'banks',
          column: 'name',
          where: {
            user_uuid,
          },
        }),
      ]),
    };
  }

  private schema(userUuid: string): ParsedTypedSchema<TypedSchema>;
  private schema(typedSchema: TypedSchema): ParsedTypedSchema<TypedSchema>;
  private schema(userUuidOrTypedSchema: string | TypedSchema): ParsedTypedSchema<TypedSchema> {
    if (typeof userUuidOrTypedSchema === 'string') {
      return schema.create(this.typedSchema(userUuidOrTypedSchema));
    }
    return schema.create(userUuidOrTypedSchema);
  }

  public async index({ auth, response }: HttpContextContract) {
    const user = auth.user!;
    await user.load('banks', (query) => query.withScopes((scopes) => scopes.clientSide));
    response.ok(user.banks);
  }

  public async store({ auth, logger, response, request }: HttpContextContract) {
    const user = auth.user!;
    const payload = await request.validate({
      schema: this.schema({
        ...this.typedSchema(user.uuid),
        publicToken: schema.string({ trim: true }),
      }),
    });

    try {
      const itemPublicTokenExchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token: payload.publicToken,
      });

      await user.related('banks').create({
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

  public async show({}: HttpContextContract) {}

  public async update({ auth, params, response, request, logger }: HttpContextContract) {
    const user = auth.user!;
    const payload = await request.validate({
      schema: this.schema({
        ...this.typedSchema(user.uuid),
        updateAccessToken: schema.boolean.nullableAndOptional(),
      }),
    });
    await user.load('banks', (query) =>
      query.withScopes((scopes) => [scopes.clientSide, scopes.uuid(params.id)])
    );

    if (user.banks.length === 0) {
      return response.notFound();
    }

    if (payload.updateAccessToken) {
      try {
        const plaidLinkTokenResponse = await plaidClient.linkTokenCreate({
          ...linkTokenCreateRequestWithoutUserAndProducts,
          user: {
            client_user_id: user.uuid,
          },
          access_token: user.accessToken,
        });
        return response.ok(plaidLinkTokenResponse.data);
      } catch (error) {
        logger.error(error.message);
        return response.serviceUnavailable({ error: error.message });
      }
    }

    const bank = user.banks[0];
    bank.name = payload.name;
    await bank.save();

    return response.ok(bank);
  }

  public async resolveItemAccessToken({ auth, response, params }: HttpContextContract) {
    const user = auth.user!;
    await user.load('banks', (query) => {
      query.withScopes((scopes) => scopes.uuid(params.id));
    });

    if (user.banks.length === 0) {
      return response.notFound();
    }

    const bank = user.banks[0];
    // TODO: check updateRequiredReason and test to see if there are multiple reasons before removing updateRequired status
    bank.updateRequired = false;
    bank.updateRequiredReason = null;
    await bank.save();

    return response.ok(null);
  }

  public async destroy({ auth, params, response, logger }: HttpContextContract) {
    const user = auth.user!;
    await user.load('banks', (query) => query.withScopes((scopes) => scopes.uuid(params.id)));

    if (user.banks.length === 0) {
      return response.notFound();
    }

    const bank = user.banks[0];

    try {
      await plaidClient.itemRemove({
        access_token: bank.accessToken,
      });
    } catch (error) {
      logger.error(error.message);
      return response.serviceUnavailable(error.message);
    }

    await bank.delete();

    return response.ok(null);
  }
}
