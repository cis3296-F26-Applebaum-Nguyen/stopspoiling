# Development setup

Use Node.js 20 or newer and Yarn Classic 1.22.22. From the repository root:

```sh
yarn install --frozen-lockfile
yarn typecheck
```

The root install links all four coding workspaces and installs their dependencies.
The package name is what you use in imports and Yarn commands.

| Folder | Package | Responsibility |
| --- | --- | --- |
| `apps/extension` | `@stopspoiling/extension` | Chrome popup and content scripts and background worker |
| `packages/engine` | `@stopspoiling/engine` | Pure spoiler matching without browser APIs |
| `packages/shared` | `@stopspoiling/shared` | Shared game and storage contracts |
| `services/schedule-updater` | `@stopspoiling/schedule-updater` | Node script that fetches schedules |

Check one package with `yarn workspace @stopspoiling/extension typecheck`.
Add dependencies with `yarn workspace <package-name> add <dependency>`.
Use `add --dev` for development tools. Commit the root `yarn.lock` when it changes.

All packages extend `tsconfig.base.json`. The extension enables browser types and
bundler imports. The updater enables Node types. Shared code and the matching
engine have neither browser nor Node globals so they can stay portable.
Export reusable types and functions from each library's `src/index.ts`.
Declare any new workspace dependency in the consuming package's `package.json`
using its matching version (`0.0.0`) and run `yarn install` to link it.

This is scaffolding only. The entry files are placeholders and `typecheck` emits
no JavaScript. There is no extension build or runnable updater yet. Issue #8 adds
the extension toolchain and issue #11 adds the updater's runtime command.
The libraries currently export TypeScript source for those future toolchains.

## Documentation website

The course documentation stays a separate Yarn project with its existing lockfile
and deployment workflow. The root install does not install its dependencies.

```sh
yarn --cwd documentation install --frozen-lockfile
yarn --cwd documentation build
yarn --cwd documentation start
```

Without `ORG_NAME` and `PROJECT_NAME` the site uses its existing Docs Dev Mode.
Use the address printed by the server.
