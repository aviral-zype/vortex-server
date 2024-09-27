import express from "express";
import { Resend } from "resend";
import cors from 'cors'
import { createPool } from '@vercel/postgres';


const app = express();
const resend = new Resend("re_amoy2sjc_E6woU4xYVPXU2K9Kk67PVN2H");
const connectionStringP = "postgres://default:eAK0Dj3TnExo@ep-aged-field-a1vjagdu-pooler.ap-southeast-1.aws.neon.tech/verceldb?sslmode=require";


app.use(cors());
app.use(express.json());

app.listen(3000, () => {
  console.log('Listening on port 3000!');
});

app.get('/', (req, res) => {
  const {param1} = req.query;

  res.send('Hello World!<br>Param1 = ' + param1);
});


app.post("/submit", async (request, response) => {
  const pool = createPool({
    connectionString: connectionStringP,
  });

  const { name, phonenumber, email, description, country, message } = request.body;
  const ip = request.ip;

  try {
    // Execute both tasks in parallel
    const [insertResult, emailResult] = await Promise.all([
      pool.sql`INSERT INTO Leads (name, phonenumber, email, description, country, ip) VALUES (${name}, ${phonenumber}, ${email}, ${description}, ${country}, ${ip});`,
      resend.emails.send({
        from: `Vortex Admin - ${name} <support@vortexio.tech>`,
        to: "aviralgupta6@gmail.com",
        subject: `Submission from ${name}`,
        html: `<p>Hi Boss,</p><p>Following Data has been received from ${name}. Email: ${email}<br/><strong>message: ${message}</strong></p>`,
      })
    ]);

    // Close the pool connection
    await pool.end();

    // Handle response for successful operations
    response.status(200).json({
      leadData: insertResult.data,
      emailData: emailResult.data,
    });
  } catch (error) {
    // Handle error from any of the operations
    response.status(400).json({ error });
  }
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