Svarog for Firestore
=======

🚨 **This project is no longer maintained. With Svarog, I was trying to see if it was possible to create a DB-first service where Firestore would handle the CRUD and the rest of the operations would be carried out in background via Triggers. The conclusion is that a) it's definitely possible and b) you're going to wish you went with the traditional RESTful monolith architecture very soon. It's way too complex for a simple project and way too limited for anything larger than a TODO app. It _was_ fun to build though :) Thanks to everyone who gave it a try!**

Svarog is a CLI that helps you protect your [Firestore](https://cloud.google.com/firestore) schema from unwanted mutations. It generates a set of of helper functions based on [JSON Schema](https://json-schema.org) files that you can use in your [Security Rules](https://firebase.google.com/docs/firestore/security/get-started) to validate user input.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/svarog.svg)](https://npmjs.org/package/svarog)
[![CircleCI](https://circleci.com/gh/dantothefuture/svarog/tree/master.svg?style=shield)](https://circleci.com/gh/dantothefuture/svarog/tree/master)
[![Codecov](https://codecov.io/gh/dantothefuture/svarog/branch/master/graph/badge.svg)](https://codecov.io/gh/dantothefuture/svarog)

> **Note**: if you are an npm user, please avoid installing versions 0.5.0 to 1.2.5 - there was an issue (#11) with the project config that resulted in empty packages being published to npm.

## Getting started

### Step 1: describe your schema

Svarog was designed to be compatible with [JSON Schema 7](https://json-schema.org/draft-07/json-schema-release-notes.html) - the latest draft of the JSON Schema standard. To get started, create a folder in your project directory, place your schema in a `*.json` file and give it an `$id`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "Apple",
  "type": "object",
  "properties": {
    "color": {
      "type": "string",
      "enum": ["green", "red"]
    }
  },
  "required": ["color"]
}
```

You can use any built-in type to describe your database schema. However, you should also keep in mind that not all of the JSON Schema features are [supported](docs/compatibility.md) at the moment.

#### Using Firestore data types

Svarog includes basic support for `Timestamp`, `Bytes`, `LatLng` and `Path` Firestore field types. To enable type checking on such fields, register the appropriate schemas in `definitions` section and then reference them in your main schema with `$ref` like this:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "FirestoreExample",
  "type": "object",
  "definitions": {
    "Timestamp": {},
  },
  "properties": {
    "date": { "$ref": "#/definitions/Timestamp" },
  }
}
```

### Step 2: run Svarog

Once you have your schema ready, install and run Svarog:

```bash
$ npm i -g svarog
$ svarog "schema/*.json" "firestore.rules" --verbose
```

The last command will pull every schema in `schema` folder, run the compiler and append a minified code snippet to the `firestore.rules` file. You can run this command every time you update your schema, and it will replace the generated snippet for you automatically if both old and new helpers were created with the compatible versions of CLI.

### Step 3: call `isValid()` in Security Rules

The code we generated in the previous step exposes `isValid($id: string): boolean` function that you can use in your Security Rules together with other assertions:

```
match /apples/{appleId} {
  allow write: if isValid("Apple");
}
```

Svarog will apply a *strict* schema check when a document is created (assuring that all required properties are present and nothing out of the schema is added), and a *loose* one on each update (when some properties defined in schema may be missing from the patch object).

## CLI reference

```bash
USAGE
  $ svarog INPUT [OUTPUT]

ARGUMENTS
  INPUT   input file containing JSON Schema or a glob pattern
  OUTPUT  target file where Svarog will output security rule helpers

OPTIONS
  -f, --force    overwrites existing Svarog code unconditionally
  -h, --help     displays this message
  -v, --verbose  enables progress logs during compilation
```
