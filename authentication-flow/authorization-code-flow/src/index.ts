import express from "express";

const app = express();

app.get("/login", (req, res) => {

  const loginParams = new URLSearchParams({
    client_id: "fullcycle-client",
    redirect_uri: "http://localhost:3000/test",
    response_type: "code",
    scope: "openid",
  });

  const url = `http://localhost:8080/realms/fullcycle-realm/protocol/openid-connect/auth?${loginParams.toString()}`;
  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const bodyParams = new URLSearchParams({
    client_id: "fullcycle-client",
    grant_type: "authorization_code",
    code: req.query.code as string,
    redirect_uri: "http://localhost:3000/test",
  });

  const url = `http://host.docker.internal:8080/realms/fullcycle-realm/protocol/openid-connect/token`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams.toString(),
  });
 
  const result = await response.json();

  console.log("result", result); 

  res.json(result);

});



app.listen(3000, () => {
  console.log("Listening on port 3000");
});
