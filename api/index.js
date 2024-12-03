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
  function getIpFromRequest (request, sessionIp) {
    try {
      var ip = request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.connection.socket.remoteAddress;
      ip = ip.split(',')[0];
      ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
      return ip;
    } catch (error) {
      return sessionIp;
    }
  }

  const { name, phonenumber, email, description, country, message, sessionIp } = request.body;
  const ip = getIpFromRequest(request, sessionIp);


  try {
    // Execute both tasks in parallel
    const [insertResult, emailResult] = await Promise.all([
      pool.sql`INSERT INTO Leads (name, phonenumber, email, description, country, ip) VALUES (${name}, ${phonenumber}, ${email}, ${description}, ${country}, ${ip});`,
      resend.emails.send({
        from: `Vortex Admin - ${name} <support@vortexio.tech>`,
        to: ["aviralgupta6@gmail.com", 'riteshyadav.vortextech@gmail.com'],
        subject: `New Submission from ${name}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
        }
        p {
            margin-bottom: 15px;
        }
        strong {
            color: #2c3e50;
        }
        .header {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .data {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <p class="header">Hi Boss,</p>
    <p>The following data has been received from <strong>${name}</strong>:</p>
    <div class="data">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${description}</p>
        <p><strong>Phone Number:</strong> ${phonenumber}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>IP:</strong> ${ip}</p>
    </div>
</body>
</html>
`,
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

app.post("/krsform", async (request, response) => {
  function getIpFromRequest (request) {
    try {
      var ip = request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.connection.socket.remoteAddress;
      ip = ip.split(',')[0];
      ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
      return ip;
    } catch (error) {
      return "";
    }
  }

  const { name, phonenumber, email, description, country } = request.body;
  const ip = getIpFromRequest(request);

  try {
    // Execute both tasks in parallel
    const [emailResult] = await Promise.all([
      resend.emails.send({
        from: `KRS Group - ${name} <krsgroup@vortexio.tech>`,
        to: ["aviralgupta6@gmail.com", 'krsgroups96@gmail.com'],
        subject: `New Submission from ${name}`,
        html: `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      margin: 20px;
                      color: #333;
                  }
                  p {
                      margin-bottom: 15px;
                  }
                  strong {
                      color: #2c3e50;
                  }
                  .header {
                      font-size: 1.5em;
                      font-weight: bold;
                      margin-bottom: 20px;
                  }
                  .data {
                      background-color: #f9f9f9;
                      padding: 10px;
                      border-radius: 5px;
                      border: 1px solid #e0e0e0;
                  }
              </style>
          </head>
          <body>
              <p class="header">Hi Vishal,</p>
              <p>The following Query has been received from <strong>${name}</strong>:</p>
              <div class="data">
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Message:</strong> ${description}</p>
                  <p><strong>Phone Number:</strong> ${phonenumber}</p>
                  <p><strong>IP:</strong> ${ip}</p>
              </div>
          </body>
          </html>
          `,
      })
    ]);

    // Close the pool connection

    // Handle response for successful operations
    response.status(200).json({
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