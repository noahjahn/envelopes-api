import Env from '@ioc:Adonis/Core/Env';
import { Configuration, PlaidApi, PlaidEnvironments, LinkTokenCreateRequest } from 'plaid';
import { CountryCode, Products } from 'plaid';

if (
  Env.get('PLAID_CLIENT_ID') === undefined ||
  Env.get('PLAID_CLIENT_ID') === '' ||
  Env.get('PLAID_CLIENT_ID') === null ||
  Env.get('PLAID_SECRET') === undefined ||
  Env.get('PLAID_SECRET') === '' ||
  Env.get('PLAID_SECRET') === null
) {
  throw new Error('Plaid client id and secret are required as environment variables');
}

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': Env.get('PLAID_CLIENT_ID'),
      'PLAID-SECRET': Env.get('PLAID_SECRET'),
    },
  },
});
const plaidClient = new PlaidApi(configuration);

// INFO: interesting way to pull type attributes from another type
export type LinkTokenCreateRequestWithoutUserAndProducts = {
  client_id: LinkTokenCreateRequest['client_id'];
  secret: LinkTokenCreateRequest['secret'];
  client_name: LinkTokenCreateRequest['client_name'];
  language: LinkTokenCreateRequest['language'];
  country_codes: LinkTokenCreateRequest['country_codes'];
};

export const linkTokenCreateRequestWithoutUserAndProducts: LinkTokenCreateRequestWithoutUserAndProducts =
  {
    client_id: Env.get('PLAID_CLIENT_ID'),
    secret: Env.get('PLAID_SECRET'),
    client_name: 'Envelopes',
    language: 'en',
    country_codes: [CountryCode.Us],
  };

export const products: Products[] = [Products.Auth];

export default plaidClient;
