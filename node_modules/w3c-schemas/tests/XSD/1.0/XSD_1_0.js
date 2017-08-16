var Jsonix = require('jsonix').Jsonix;
var XSD_1_0 = require('../../../w3c-schemas').XSD_1_0;

var roundtrips = require('../../roundtrip').roundtrips;
var mappings = [XSD_1_0];
module.exports = {
	"Context": function(test) {
		var context = new Jsonix.Context(mappings);
		test.done();
        },
	"Example" : function(test) {
		var context =  new Jsonix.Context([XSD_1_0]);
		var unmarshaller = context.createUnmarshaller();
		unmarshaller.unmarshalFile("tests/XSD/1.0/Schema-01.xml", function(result) {

			var schema = result.value;
			var tns = schema.targetNamespace;
			var complexTypes = schema.complexType;

			var featureTypes = {};
			for (var index = 0; index < complexTypes.length; index++)
			{
				var featureType = {};
				var complexType = complexTypes[index];
				var name = complexType.name;
				var qname = new Jsonix.XML.QName(tns, name);
				featureType.typeName = qname;

				featureTypes[qname.key] = featureType;


				var elements = [];

				if (complexType.complexContent && complexType.complexContent.extension && complexType.complexContent.extension.sequence && complexType.complexContent.extension.sequence.element)
				{
					elements = elements.concat(complexType.complexContent.extension.sequence.element);
				}

				if (complexType.sequence && complexType.sequence.element)
				{
					elements = elements.concat(complexType.sequence.element);
				}
				featureType.properties = {};

				for (var jndex = 0; jndex < elements.length; jndex++)
				{
					var element = elements[jndex];
					var property = {
						name: new Jsonix.XML.QName(tns, element.name),
						type: element.type,
						collection: (element.maxOccurs === 'unbounded')
					};
					featureType.properties[element.name] = property;
				}
			}

			var featureElements = {};

			for (var kndex = 0; kndex < schema.element.length; kndex++)
			{
				var topLevelElement = schema.element[kndex];
				featureElements[topLevelElement.name] = featureTypes[topLevelElement.type.key];
			}
				
			console.log(featureElements);
			test.done();
		});
	}//,
//	"Roundtrips" : roundtrips(mappings, __dirname)
};