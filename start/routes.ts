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
import HealthCheck from '@ioc:Adonis/Core/HealthCheck';
import Env from '@ioc:Adonis/Core/Env';

Route.get('/', async ({ response }) => {
  response.redirect('health');
});

Route.group(() => {
  Route.get('callback', 'OAuthController.index');
  Route.get('redirect', 'OAuthController.redirect');
}).prefix('oauth/:provider');

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport();

  report.healthy ? response.ok(report) : response.badRequest(report);
});

Route.group(() => {
  Route.get('logged-in', async ({ auth, response }) => {
    await auth.use('web').authenticate();
    response.send(auth.use('web').isLoggedIn);
  });
  Route.get('logout', async ({ auth, response }) => {
    await auth.use('web').authenticate();
    await auth.use('web').logout();

    response.redirect(Env.get('FRONTEND_URL'));
  });
}).prefix('auth');

import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  LinkTokenCreateRequest,
  CountryCode,
  LinkTokenCreateRequestUser,
  Products,
} from 'plaid';
Route.group(() => {
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
}).middleware('auth');
