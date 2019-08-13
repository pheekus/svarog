🔥 Svarog 🔥
=======

Svarog is a CLI that helps you protect your [Firestore](https://cloud.google.com/firestore) schema from unwanted mutations. It generates a set of of helper functions based on [JSON Schema](https://json-schema.org) files that you can use in your [Security Rules](https://firebase.google.com/docs/firestore/security/get-started) to validate user input.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/svarog.svg)](https://npmjs.org/package/svarog)
[![CircleCI](https://circleci.com/gh/dantothefuture/svarog/tree/master.svg?style=shield)](https://circleci.com/gh/dantothefuture/svarog/tree/master)
[![Codecov](https://codecov.io/gh/dantothefuture/svarog/branch/master/graph/badge.svg)](https://codecov.io/gh/dantothefuture/svarog)
[![Downloads/week](https://img.shields.io/npm/dw/svarog.svg)](https://npmjs.org/package/svarog)
[![License](https://img.shields.io/npm/l/svarog2.svg)](https://github.com/@dantothefuture/svarog/blob/master/package.json)


# Warning

This package **is not production-ready** by any means. Just look at the coverage, pal, you don't want that in your enterprise-level project with bright future.

# Usage

## 🚚 Step 1 - install the package

```bash
$ npm i -g svarog
```

You can also install Svarog locally and run it either as `node_modules/.bin/svarog` in your terminal or using the short syntax in the `scripts` section of your `package.json`.

## 📃 Step 2 - describe your schema

Svarog was designed for [JSON Schema 7](https://json-schema.org/draft-07/json-schema-release-notes.html), but chances are that the earlier standards will be compatible with it as well. Here's an example `schema.json` file:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "Apple",
  "type": "object",
  "properties": {
    "color": {
      "type": "string",
      "enum": [ "green", "red" ]
    }
  },
  "required": [ "color" ]
}
```

⚠ **IMPORTANT:** one **valid** schema is expected per file. Support for references is coming soon. Some of the JSON Schema features are not supported.

## ⚡ Step 3 - run Svarog

Svarog is silent by default, and its only required argument is the path to the file containing your schema. You can also pass a [glob](https://www.npmjs.com/package/glob) pattern to process multiple files at once.

```bash
$ svarog --verbose schema.json firestore.rules
```

The command above will write the following to the `firestore.rules` file in the current working directory:

```
function isAppleValid(d) {
  return d.color && d.color is string && (d.color == 'green' || d.color == 'red');
}
```

You can then use this function in your Firestore Security Rules like this:

```
match /apples/{appleId} {
  allow create: if isAppleValid(request.resource.data);
}
```

# Reference

```bash
USAGE
  $ svarog INPUT [OUTPUT]

ARGUMENTS
  INPUT   input file containing JSON Schema or a glob pattern
  OUTPUT  target file where Svarog will output security rule helpers

OPTIONS
  -f, --force    overwrites the output file if it exists
  -h, --help     displays this message
  -v, --verbose  enables progress logs during compilation
```
