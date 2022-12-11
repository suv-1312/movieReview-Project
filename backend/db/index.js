const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

mongoose.connect("mongodb://suv1312:Hatisha1312@ac-z2kalr3-shard-00-00.4bonjnv.mongodb.net:27017,ac-z2kalr3-shard-00-01.4bonjnv.mongodb.net:27017,ac-z2kalr3-shard-00-02.4bonjnv.mongodb.net:27017/?ssl=true&replicaSet=atlas-klvseg-shard-0&authSource=admin&retryWrites=true&w=majority",
	{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    }
).
then(() => {
	console.log("database Connected");
}).catch((ex) => {
	console.log("Connection Failed : ",ex);
});

