process.on('uncaughtException', function(err) {
  console.error(err.stack);
});
module.exports = 
{
	"w3c-schemas": require('./w3c-schemas')
};
