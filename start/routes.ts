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

Route.group(() => {
  Route.get('me', 'ProfilesController.me');
})
  .prefix('profile')
  .middleware('auth');

Route.group(() => {
  Route.get('/link/token', 'PlaidController.linkToken');
  Route.post('/item/access-token', 'PlaidController.itemAccessToken');
})
  .prefix('plaid')
  .middleware('auth');

Route.resource('banks', 'BanksController')
  .apiOnly()
  .middleware({
    '*': ['auth'],
  });
