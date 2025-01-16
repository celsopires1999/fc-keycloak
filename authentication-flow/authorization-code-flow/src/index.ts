import express from "express";
import session from "express-session";
import jwt from "jsonwebtoken";

import crypto from "crypto";

const app = express();

const memoryStore = new session.MemoryStore();
const callbackTest = "/callback";

app.use(
  session({
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
    store: memoryStore,
    //expires
  })
);

app.get("/login", (req, res) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  const state = crypto.randomBytes(16).toString("base64");

  //@ts-expect-error - type mismatch
  req.session.nonce = nonce;
  //@ts-expect-error - type mismatch
  req.session.state = state;
  req.session.save();

  const loginParams = new URLSearchParams({
    client_id: "fullcycle-client",
    redirect_uri: `http://localhost:3000/${callbackTest}`,
    response_type: "code",
    scope: "openid",
    nonce,
    state,
  });

  const url = `http://localhost:8080/realms/fullcycle-realm/protocol/openid-connect/auth?${loginParams.toString()}`;
  res.redirect(url);
});

app.get("/callback", async (req, res) => {

  //@ts-expect-error - type mismatch
  if (req.session.user) {
    return res.redirect("/admin");
  }

  //@ts-expect-error - type mismatch
  if(req.query.state !== req.session.state) {
    //poderia redirecionar para o login em vez de mostrar o erro
    return res.status(401).json({ message: "Unauthenticated" });
  }

  console.log(req.query);

  const bodyParams = new URLSearchParams({
    client_id: "fullcycle-client",
    grant_type: "authorization_code",
    code: req.query.code as string,
    redirect_uri: `http://localhost:3000/${callbackTest}`,
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

  const payloadAccessToken = jwt.decode(result.access_token) as any;
  const payloadRefreshToken = jwt.decode(result.refresh_token) as any;
  const payloadIdToken = jwt.decode(result.id_token) as any;

  console.log("payloadAccessToken!.nonce", payloadAccessToken!.nonce);
    //@ts-expect-error - type mismatch
  console.log("req.session.nonce", req.session.nonce);
    
  if (
    //@ts-expect-error - type mismatch
    payloadAccessToken!.nonce !== req.session.nonce ||
    //@ts-expect-error - type mismatch
    payloadRefreshToken.nonce !== req.session.nonce ||
    //@ts-expect-error - type mismatch
    payloadIdToken.nonce !== req.session.nonce
  ) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  // console.log(payloadAccessToken);
  //@ts-expect-error - type mismatch
  req.session.user = payloadAccessToken;
  //@ts-expect-error - type mismatch
  req.session.access_token = result.access_token;
  //@ts-expect-error - type mismatch
  req.session.id_token = result.id_token;
  req.session.save();
  res.json(result);

});



app.listen(3000, () => {
  console.log("Listening on port 3000");
});
