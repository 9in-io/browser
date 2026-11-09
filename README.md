9in Browser SDK
===============

<img src="docs/img/logo.png" width="160" alt="9in"/>

The [9in](https://9in.io) sign-in SDK as one `<script>` tag.

This package is a ready-to-use browser build of [`@9in-io/sdk`](https://www.npmjs.com/package/@9in-io/sdk),
the official 9in JavaScript SDK. It exposes `NineAuth` on `window.Nine`: authorization code
flow with PKCE, refresh token rotation and logout against your tenant's standard OpenID
Connect endpoints. ~8 KB minified, no dependencies.

**Using a bundler (Vite, webpack, Next.js…) or Node?** Install `@9in-io/sdk` (browser and
server) or `@9in-io/node` instead. This package only adds the prebuilt files.

Upgrading from `@ssofy/javascript-sdk` 1.x? Read [MIGRATION.md](MIGRATION.md).

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@9in-io/browser@2/dist/9in.min.js"></script>

<!-- UMD (AMD / CommonJS / global) -->
<script src="https://cdn.jsdelivr.net/npm/@9in-io/browser@2/dist/9in.umd.min.js"></script>
```

## Usage

```html
<script>
    const auth = new Nine.NineAuth({
        issuer: 'https://acme.9in.io',            // or your custom login domain
        clientId: 'app_…',                        // a single-page application in the console
        redirectUri: location.origin + '/callback',
        // audience: 'https://api.acme.com',      // access tokens for your API
    });

    // Sign in / sign up
    document.querySelector('#login').onclick = () => auth.login({returnTo: location.pathname});
    document.querySelector('#signup').onclick = () => auth.signup();

    // On /callback
    if (location.pathname === '/callback') {
        auth.handleRedirect().then(({user, returnTo}) => location.replace(returnTo ?? '/'));
    }

    // Anywhere
    const user = await auth.getUser();                       // ID token claims or null
    const res = await auth.fetch('https://api.acme.com/orders');   // Bearer token, refreshed automatically
    await auth.logout({returnTo: location.origin});
</script>
```

The full API is documented in the [`@9in-io/sdk` README](https://www.npmjs.com/package/@9in-io/sdk).
Errors are `Nine.NineError` with a `code` (`login_required`, `invalid_state`, …).

## Development

```bash
npm install     # links @9in-io/sdk from ../../v2/packages/sdk (see package.json)
npm test        # builds dist/ and runs the bundles against a fake tenant
```

`html/test.html` is a manual test page for a real tenant.

## License

The MIT License (MIT). See [LICENSE](LICENSE). 9in and SSOfy are by [Cubelet Ltd](https://cubelet.co.uk).
