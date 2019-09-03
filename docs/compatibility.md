JSON Schema compatibility status
================================

Features **not** listed below are **supported** by Svarog. If you find this list incomplete, please open an issue.

## In development

Features on this list are not currently supported, but planned for the future releases. `$ref` has a limited functionality at this point, powering only Firestore-specific data types.

|Type|Features|
|--|--|
|`object`|`dependencies`|
|`other`|`allOf`, `$ref`|

## Under consideration

JSON Schema features listed below may be implemented in future releases, but aren't a priority at the moment.

|Type|Features|
|--|--|
|`string`|`format`|
|`other`|`anyOf`, `oneOf`, `not`, `if`, `then`, `else`|

## Not planned

Functionality that can't be implemented in CEL or doesn't belong in Security Rules for one reason or another.

|Type|Features|
|--|--|
|`array`| List validation, `uniqueItems` - arrays of arbitrary length are hard to validate in Firestore rules because CEL doesn't provide a way of iterating through the list (something like `.every()` in js).|
|`object`|`propertyNames`, `patternProperties` - such assertions would ultimately require the same capabities as described above, which doesn't seem possible at the moment.|
|`media`|`contentMediaType`, `contentEncoding` - while it could be possible to add support for these keys, it's hard to imagine a good use case for them in Cloud Firestore.|
