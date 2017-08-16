# W3C Schemas

`w3c-schemas` package provides [Jsonix](https://github.com/highsource/jsonix) XML-JSON bindings for some of the XML Schemas defined by W3C.

This allows converting between XML (conforming to one of these schemas) and JSON in with pure JavaScript.

Supports the following schemas:

* `Atom_1_0`
* `WS_Addr_1_0_Core`
* `XHTML_1_0_Strict`
* `XLink_1_0`
* `XSD_1_0`

# Example

```javascript

var XLink_1_0 = require('w3c-schemas').XLink_1_0;

var context =  new Jsonix.Context([XLink_1_0]);
var unmarshaller = context.createUnmarshaller();
unmarshaller.unmarshalFile("tests/locator-01.xml", function(result) {
	test.equal("label", result.value.label);
	test.done();
});
```
