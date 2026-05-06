const express =require('express');
const cors = require('cors');
const bodyParser=require('body-parser');
require('dotenv').config();
const app=express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});
const mongoose=require('mongoose');
const usersnearby=require('./routes/nearby-issues-routes');
const userscatégoriesmarker=require('./routes/catégories-marker-route');
const usersroutes=require('./routes/users-routes');
const usersmarkers=require('./routes/markers-routes');
const usersreports=require('./routes/reports-routes');
const HttpError=require('./models/http-error');
app.use(express.json()); 
app.use('/api/nearby',usersnearby);
app.use('/api/cat',userscatégoriesmarker);
app.use('/api/markers', usersmarkers);
app.use('/api/users', usersroutes);
app.use('/api/reports', usersreports);
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});
mongoose.connect(process.env.MONGO_URL || 'mongodb://pipeline-mongodb-1:27017/mern')  .then(()=>{app.listen(3001);})
.catch(err=>{
  console.log(err);
});
