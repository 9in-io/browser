/**
 * Script-tag build of @9in-io/sdk. Everything is exposed on `window.Nine`:
 *
 *   <script src="https://cdn.jsdelivr.net/npm/@9in-io/browser@2/dist/9in.min.js"></script>
 *   const auth = new Nine.NineAuth({issuer, clientId, redirectUri});
 */
export * from '@9in-io/sdk';

declare const __VERSION__: string;
export const version: string = __VERSION__;
