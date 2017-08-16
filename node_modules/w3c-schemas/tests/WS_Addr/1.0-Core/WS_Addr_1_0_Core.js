var Jsonix = require('jsonix').Jsonix;
var WS_Addr_1_0_Core = require('../../../w3c-schemas').WS_Addr_1_0_Core;
var roundtrips = require('../../roundtrip').roundtrips;
var mappings = [WS_Addr_1_0_Core];
module.exports = {
	"Context": function(test) {
		var context = new Jsonix.Context(mappings);
		test.done();
        },
	"Roundtrips" : roundtrips(mappings, __dirname)
};