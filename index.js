import express from "express";
import cors from 'cors';
const axios from 'axios';


const app = express();


app.use(cors());
app.use(express.json());

app.listen(3000, () => {
  console.log('Listening on port 3000!');
});

app.get('/', (req, res) => {
  const {param1} = req.query;

  res.send('Hello World!<br>Param1 = ' + param1);
});




let nexPersonId = 3;
const people = [
  {id: 1, name: 'John', surname: 'Doe'},
  {id: 2, name: 'Anna', surname: 'Dopey'},
];

app.get('/people', (req, res) => {
  res.send(people);
});

app.get('/people/:id', (req, res) => {
  const personId = +req.params.id;

  const person = people.find(person => person.id === personId);

  if(!person) {
    res.sendStatus(404);
    return;
  }

  res.send(person);
});

app.post('/people', (req, res) => {
  if(!req.body){
    res.status(400).json({ error: 'Body not specified' });
    return;
  }

  if(!req.body.name){
    res.status(400).json({ error: 'No name specified' });
    return;
  }

  if(!req.body.surname){
    res.status(400).json({ error: 'No surname specified' });
    return;
  }

  const newPerson = {
    ...req.body,
    id: nexPersonId++
  };

  people.push(newPerson);

  res.send(newPerson);
});

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Missing "url" query param');
  
    try {
      const response = await axios.get(targetUrl, { responseType: 'stream' });
  
      // Copy all headers EXCEPT CORS headers that cause conflicts
      for (const [key, value] of Object.entries(response.headers)) {
        if (
          key.toLowerCase() !== 'access-control-allow-origin' &&
          key.toLowerCase() !== 'access-control-allow-credentials'
        ) {
          res.setHeader(key, value);
        }
      }
  
      // Add your own CORS headers for your frontend:
    //   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001'); // React dev server URL
    //   res.setHeader('Access-Control-Allow-Credentials', 'true'); // If needed
      const origin = req.headers.origin;
        if (origin) {
        // Reflect the Origin header back if you trust it
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true'); // if credentials used
        } else {
        // fallback if no Origin header (rare)
        res.setHeader('Access-Control-Allow-Origin', '*');
        }

  
      // Stream the response data to frontend
      response.data.pipe(res);
    } catch (error) {
      res.status(500).send(`Error fetching: ${error.message}`);
    }
  });
