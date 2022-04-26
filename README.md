[![CI](https://github.com/DmitryBogomolov/monorepo-deps-checker-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/DmitryBogomolov/monorepo-deps-checker-cli/actions/workflows/ci.yml)

# monorepo-deps-checker-cli

Command line interface for [monorepo-deps-checker](https://github.com/DmitryBogomolov/monorepo-deps-checker)

## Install

```bash
npm i monorepo-deps-checker-cli
```

## Description

Provides command line interface for **monorepo-deps-checker**.

```bash
mdc [options]
```

Target repo is assumed to be in current directory. Another directory can be provided with the **dir** option.

```bash
mdc --dir path/to/repo
```

Found conflicts are resolved via command line prompt in interactive mode. Use options to resolve conflicts automatically (without prompt).

Option | Description
-|-
print | print conflicts (without resolving)
skip-packages | skip packages conflicts
skip-modules | skip modules conflicts
resolve-packages | resolve packages conflicts
take-new-module | resolve module conflicts with newest version
take-frequent-module | resolve module conflicts with most frequent version
ignore-packages | ignored packages (comma separated)
ignore-modules | ignored modules (comma separated)
