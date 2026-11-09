import {describe, expect, it} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createContext, runInContext} from 'node:vm';

/**
 * Runs the built bundles (dist/) the way browsers load them and drives a full sign-in
 * against a fake 9in tenant.
 */
const dist = join(__dirname, '../../dist');
const issuer = 'https://acme.9in.test';

class MemoryStorage {
    private map = new Map<string, string>();
    getItem(key: string) {
        return this.map.get(key) ?? null;
    }
    setItem(key: string, value: string) {
        this.map.set(key, value);
    }
    removeItem(key: string) {
        this.map.delete(key);
    }
}

function base64url(value: unknown) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function loadWindowBuild(): any {
    const window: Record<string, unknown> = {};
    const context = createContext({window, self: window, crypto, TextEncoder, TextDecoder, URL, URLSearchParams, Headers, Request, Response, btoa, atob, console});
    runInContext(readFileSync(join(dist, '9in.min.js'), 'utf8'), context);
    return window.Nine;
}

function fakeTenant() {
    let nonce = '';
    const tokenForms: URLSearchParams[] = [];
    const fetch = async (input: string | URL, init?: RequestInit) => {
        const url = String(input);
        const json = (body: unknown) => new Response(JSON.stringify(body), {headers: {'Content-Type': 'application/json'}});
        if (url === `${issuer}/.well-known/openid-configuration`) {
            return json({
                issuer,
                authorization_endpoint: `${issuer}/oauth/authorize`,
                token_endpoint: `${issuer}/oauth/token`,
                userinfo_endpoint: `${issuer}/oauth/userinfo`,
                jwks_uri: `${issuer}/.well-known/jwks.json`,
                end_session_endpoint: `${issuer}/oauth/logout`,
            });
        }
        if (url === `${issuer}/oauth/token`) {
            const form = new URLSearchParams(String(init?.body));
            tokenForms.push(form);
            const idToken = `${base64url({alg: 'RS256'})}.${base64url({iss: issuer, aud: 'app_spa', sub: 'usr_1', nonce, email: 'jane@acme.test'})}.sig`;
            return json({access_token: 'at', id_token: idToken, refresh_token: 'rt', expires_in: 900, scope: 'openid'});
        }
        return new Response('{}', {status: 404});
    };
    return {fetch, tokenForms, setNonce: (value: string) => (nonce = value)};
}

describe('window build (dist/9in.min.js)', () => {
    it('exposes the @9in-io/sdk browser API on window.Nine', () => {
        const Nine = loadWindowBuild();
        expect(typeof Nine.NineAuth).toBe('function');
        expect(typeof Nine.NineError).toBe('function');
        expect(Nine.version).toBe(require('../../package.json').version);
    });

    it('runs the authorization code flow with PKCE', async () => {
        const Nine = loadWindowBuild();
        const tenant = fakeTenant();
        const transient = new MemoryStorage();
        let navigatedTo = '';
        const auth = new Nine.NineAuth({
            issuer,
            clientId: 'app_spa',
            redirectUri: 'https://app.acme.test/callback',
            fetch: tenant.fetch,
            storage: new MemoryStorage(),
            transientStorage: transient,
            navigate: (url: string) => (navigatedTo = url),
        });

        await auth.login({returnTo: '/orders'});
        const authorize = new URL(navigatedTo);
        expect(authorize.origin + authorize.pathname).toBe(`${issuer}/oauth/authorize`);
        expect(authorize.searchParams.get('code_challenge_method')).toBe('S256');

        const pending = JSON.parse(transient.getItem(`9in:${issuer}:app_spa:pending`)!);
        tenant.setNonce(pending.nonce);
        const {user, returnTo} = await auth.handleRedirect(`https://app.acme.test/callback?code=c0de&state=${authorize.searchParams.get('state')}`);

        expect(returnTo).toBe('/orders');
        expect(user.email).toBe('jane@acme.test');
        expect(tenant.tokenForms[0]!.get('code_verifier')).toBe(pending.verifier);
        expect(await auth.getAccessToken()).toBe('at');
    });
});

describe('UMD build (dist/9in.umd.min.js)', () => {
    it('works with CommonJS loaders', () => {
        const Nine = require(join(dist, '9in.umd.min.js'));
        expect(typeof Nine.NineAuth).toBe('function');
        expect(() => new Nine.NineAuth({issuer, clientId: '', redirectUri: ''})).toThrow(Nine.NineError);
    });
});
