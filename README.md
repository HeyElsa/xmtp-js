# XMTP JS Content Types

This repo provides JavaScript implementations of content types you can use with your app built with the XMTP client SDK for [JavaScript](https://github.com/xmtp/xmtp-js) or [React](https://github.com/xmtp/xmtp-web/packages/react-sdk).

To learn more about the contents of this repository, see this README and the READMEs provided for [packages](https://github.com/xmtp/xmtp-js-content-types/tree/main/packages).

## What's inside?

### Packages

- [`content-type-remote-attachment`](packages/content-type-remote-attachment): This package provides a remote attachment content type.

## Requirements

- Node 18+
- Yarn v3+ is required only when working with this repo. See [Yarn Installation](https://yarnpkg.com/getting-started/install).

## Running tests

Before running unit tests, a required Docker container must be started. To do so, run `yarn test:setup`. Run `yarn test:teardown` to stop the Docker container.

## Useful commands

- `yarn build`: Build all packages
- `yarn clean`: Remove all `node_modules`, `.turbo`, and build folders, clear Yarn cache
- `yarn format`: Run prettier format and write changes on all packages
- `yarn format:check`: Run prettier format check on all packages
- `yarn lint`: Lint all packages
- `yarn test`: Test all packages
- `yarn typecheck`: Typecheck all packages
