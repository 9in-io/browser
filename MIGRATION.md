# Migrating from `@ssofy/javascript-sdk` 1.x to 9in

SSOfy is now [9in](https://9in.io), and its two JavaScript SDKs are now one:
[`@9in/sdk`](https://www.npmjs.com/package/@9in/sdk). This repository
continues as `@9in/browser` 2.0, the `<script>`-tag build of `@9in/sdk`.

**Upgrading is required to use 9in.** `@ssofy/javascript-sdk` 1.x talks to the SSOfy
service (`/authorize`, `/token`, `/userinfo` on SSOfy hosts, `scopes: ['*']`). That service
has shut down (ssofy.com has lapsed), and 9in does not serve those endpoints, so 1.x does
not work with 9in. The old version stays on npm but is no longer maintained.

## Which package

| You used | Use |
|---|---|
| `npm i @ssofy/javascript-sdk` in a bundled browser app | `npm i @9in/sdk` and `import {NineAuth} from '@9in/sdk'` |
| `@ssofy/javascript-sdk` in Node (server-side login with `FileStorage`) | `npm i @9in/node` and `ServerAuth` |
| `<script src=".../ssofy.min.js">` (`window.SSOfy`) | `<script src="https://cdn.jsdelivr.net/npm/@9in/browser@2/dist/9in.min.js">` (`window.Nine`) |

## API mapping

| 1.x | 2.x / `@9in/sdk` |
|---|---|
| `new SSOfy.OAuth2Client({url, clientId, clientSecret, redirectUri, scopes, stateStore, …})` | `new Nine.NineAuth({issuer, clientId, redirectUri, scope?, audience?, storage?})`; no client secret in browsers |
| `initAuthCodeFlow(url, nextUri)` | `login({returnTo})` (PKCE S256 always) |
| `initImplicitFlow()` | Removed: the implicit flow is not recommended; use `login()` |
| `handleCallback(payload)` | `handleRedirect()` → `{user, returnTo}` |
| `getAccessToken(state)`, `renewAccessToken(state)` | `getAccessToken()` (refreshes and rotates automatically) |
| `getUserInfo(state)`, `refreshUserInfo(state)` | `getUser()` (ID token) / `fetchUserInfo()` |
| `destroy(state)` | `logout({local: true})`; `logout()` also ends the 9in session |
| `OAuth2Config.getRegistrationUrl()` | `signup()` |
| `LocalStorage`, `SessionStorage`, `CookieStorage`, `MemoryStorage`, `FileStorage`, `NullStorage` | `storage` / `transientStorage` options take any `{getItem, setItem, removeItem}` (default `localStorage` / `sessionStorage`) |
| `UrlHelper` | Not needed |
| `AuthError`, `CallbackError`, `InvalidStateError`, `RefreshTokenError` | `NineError` with `code` |

Settings: SSOfy's `url` is 9in's `issuer`; `scopes: ['*']` becomes the default
`openid profile email offline_access`. Register the redirect and logout URLs on a
single-page application in the 9in console.
