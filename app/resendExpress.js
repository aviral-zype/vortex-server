import express from "express";
import { Resend } from "resend";

const app = express();
const resend = new Resend("re_amoy2sjc_E6woU4xYVPXU2K9Kk67PVN2H");

app.get("/", async (request, response) => {

  const formData = await request.body
    const { data, error } = await resend.emails.send({
        from: `Vortex Admin - ${formData.name} <support@vortexio.tech>`,
        to: "aviralgupta6@gmail.com",
        subject: `Submission from ${formData.name}`,
        html: `<p>Hi Boss,</p><p>Following Data has been recieved from ${formData.name}. Email: ${formData.email}<br/><strong>message: ${formData.message}</strong></p>`,
    });
  if (error) {
    return response.status(400).json({ error });
  }

  response.status(200).json({ data });
});