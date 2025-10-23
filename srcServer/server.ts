import express from 'express';


const port: number = Number(process.env.PORT) || 1339 ; 
const app = express();

app.use(express.static('./dist/'));


app.listen(Number(port), () => {
  console.log(`Server running on port ${port}`);
});