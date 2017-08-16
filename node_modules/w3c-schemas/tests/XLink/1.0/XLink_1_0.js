var Jsonix = require('jsonix').Jsonix;
var XLink_1_0 = require('../../../w3c-schemas').XLink_1_0;
var roundtrips = require('../../roundtrip').roundtrips;
var mappings = [XLink_1_0];
module.exports = {
	"Context": function(test) {
		var context = new Jsonix.Context(mappings);
		test.done();
        },
	"Example" : function(test) {
		var context =  new Jsonix.Context([XLink_1_0]);
		var unmarshaller = context.createUnmarshaller();
		unmarshaller.unmarshalFile("tests/XLink/1.0/locator-01.xml", function(result) {
			test.equal("label", result.value.label);
			test.done();
		});
	},
	"Roundtrips" : roundtrips(mappings, __dirname)
};