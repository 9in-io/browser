# CHANGELOG

## 2.0.0 - unreleased

The JavaScript SDK is now **`@9in/sdk`**. This repository continues as **`@9in/browser`**, its `<script>`-tag build. See [MIGRATION.md](MIGRATION.md).

* `dist/9in.min.js` (`window.Nine`) and `dist/9in.umd.min.js`, bundled from `@9in/sdk` (~8 KB): `NineAuth` with PKCE, refresh rotation, logout, `NineError`.
* `NineAuth` refuses plain-http issuers other than localhost (`allowInsecureIssuer` to override).
* Removed the SSOfy client (`OAuth2Client`, storages, implicit flow, `UrlHelper`); use `@9in/sdk` / `@9in/node` from npm.
* Jest tests run the built bundles against a fake tenant.

## 1.2.0 * 2024-01-27

* Fixed issue with parsing query parameters in fragment.
* Added SessionStorage for browser.
* Fixed issue with confidential client authentication using clientSecret config.

## 1.1.0 * 2024-01-27

* Handled the callback errors.
* Added support for custom states.

## 1.0.3 * 2023-08-07

* Hotfix: Fixed module load issue.

## 1.0.2 * 2023-08-05

* Fixed the PKCE crypto issue with node apps.
* Introduced the new OAuth2Client::renewAccessToken().
* Fixed the FileStorage issue.

## 1.0.1 * 2023-07-30

* Removed `state` parameter from handleCallback(). 
* Added optional authorizationUrl parameter to auth initiation methods.
* Fixed the missing OAuth2ConfigParameters export.

## 1.0.0 * 2023-07-29

* First Release.
