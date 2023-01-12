/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  LinkTokenCreateRequest,
  CountryCode,
  LinkTokenCreateRequestUser,
  Products,
} from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

Route.get('/', async () => {
  return { hello: 'world' };
});

Route.get('/link/token', async () => {
  if (
    'PLAID_CLIENT_ID' in process.env &&
    process.env.PLAID_CLIENT_ID !== undefined &&
    'PLAID_SECRET' in process.env
  ) {
    const user: LinkTokenCreateRequestUser = {
      client_user_id: '1',
    };

    const linkTokenCreateRequest: LinkTokenCreateRequest = {
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      client_name: 'envelopes',
      language: 'en',
      country_codes: [CountryCode.Us],
      user,
      products: [Products.Auth, Products.Transactions],
    };
    try {
      const response = await plaidClient.linkTokenCreate(linkTokenCreateRequest);
      return response.data;
    } catch (error) {
      console.error(error);
      return { error: error.message };
    }
  }
  return { error: 'something happened' };
});
