const express = require("express");
const axios = require("axios");
const cors = require("cors");
const queryString = require("query-string");
const cookieParser = require("cookie-parser");
const randomString = require("randomstring");

const client_id = "a6bbc96e7d684f6f9bf1a1974c33caf0"; // Your client id
const client_secret = "4b505dc9e5a04f849b86416d78e945fa"; // Your secret
const redirect_uri = "http://localhost:3002/callback"; // Your redirect uri

let stateKey = "spotify_auth_state";
const app = express();
app.use(express.static(__dirname + "/public")); // I need to understand this
app.use(cors());
app.use(cookieParser());

app.get("/login", (req, res) => {
  const state = randomString.generate(16);
  res.cookie(stateKey, state);
  const scope = "user-read-private user-read-email";
  const queryConfig = {
    client_id: client_id,
    response_type: "code",
    redirect_uri: redirect_uri,
    state: state,
    scope: scope,
  };

  res.redirect(
        `https://accounts.spotify.com/authorize?${queryString.stringify({
            response_type: "code",
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state,
          })}`
    )
});

app.get("/callback", (req, res)=>{
    const code = req.query.code ? req.query.code: null;
    const state = req.query.state ? req.query.state: null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;
    if(state === null && storedState !== state){
        res.redirect(`/#${queryString.stringify({ error: "state_mismatch" })}`)
    } else {
        
    }
})

console.log("Listening on port 3002");
app.listen(3002);
