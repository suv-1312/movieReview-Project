const express = require('express');
const userRouter = require('./routes/user');

require('./db');

const app = express();

app.use(express.json());
app.use('/api/user',userRouter);

app.listen(5000,() => {
	console.log("Hello from PORT 5000");
})