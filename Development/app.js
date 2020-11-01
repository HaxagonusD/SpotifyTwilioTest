const express = require("express");
const axios = require("axios");
const cors = require("cors");
const queryString = require("query-string");
const cookieParser = require("cookie-parser");
const randomString = require("randomstring");

const client_id = "a6bbc96e7d684f6f9bf1a1974c33caf0"; // Your client id
const client_secret = "4b505dc9e5a04f849b86416d78e945fa"; // Your secret
const redirect_uri = "http://localhost:3002/callback"; // Your redirect uri
let refresh_token = undefined;

let stateKey = "spotify_auth_state";

const app = express();

app.use(express.static(__dirname + "/public")); // I need to understand this
app.use(cors());
app.use(cookieParser());

app.get("/login", (req, res) => {
  const state = randomString.generate(16);
  //   console.log(state);
  res.cookie(stateKey, state);

  const scope = "user-read-currently-playing user-read-playback-state";
  res.redirect(
    `https://accounts.spotify.com/authorize?${queryString.stringify({
      response_type: "code",
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
    })}`
  );
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(`/#${queryString.stringify({ error: "state_mismatch" })}`);
  } else {
    res.clearCookie(stateKey);
    const headers = {
      // this is basically the config object
      headers: {
        Accept: "application/json", //spotify doesn't tell you to do this
        "Content-Type": "application/x-www-form-urlencoded", // or this
      },
      auth: {
        // auth represents basic authorization becaus axios is weird
        username: client_id,
        password: client_secret,
      },
    };
    const data = {
      // this represents the request body
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect_uri,
    };

    axios
      .post(
        "https://accounts.spotify.com/api/token", // url
        queryString.stringify(data), //Why do I have to stringify it? also this is the request body
        headers // config object
      )
      .then((response) => {
        const access_token = response.data.access_token;
        refresh_token = data.refresh_token;
        const options = {
          method: "get",
          url: "https://api.spotify.com/v1/me/player/currently-playing",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        };
        axios(options)
          .then((something) => {
            console.log("This is something.data: ", something.data)
            
          })
          .catch((error) => console.error("axios 1 1 1 1 1 axios", error));
        res.send("it was done");
      })
      .catch((error) => console.error(error.data));

    //   .catch((error) => console.error("axios 2 2 2 2 2 2 2 2 2 axios ", error));
  }
});

app.get("/refresh_token", (req, res) => {
  //   const refresh_token = req.query.refresh_token;
  //   console.log(req.query)
  const headers = {
    // this is basically the config object
    headers: {
      Accept: "application/json", //spotify doesn't tell you to do this
      "Content-Type": "application/x-www-form-urlencoded", // or this
    },
    auth: {
      // auth represents basic authorization becaus axios is weird
      username: client_id,
      password: client_secret,
    },
  };
  //   const authOptions = {
  //     url: "https://accounts.spotify.com/api/token",
  //     headers: {
  //       Authorization: `Basic ${Buffer.from(
  //         `${client_id} + ":" + ${client_secret}`,
  //         "base64"
  //       )}`,
  //     },
  //     data: {
  //       grant_type: "refresh_token",
  //       refresh_token: refresh_token,
  //     },
  //   };
  const data = {
    grant_type: "refresh_token",
    refresh_token: refresh_token,
  };
  axios
    .post(
      "https://accounts.spotify.com/api/token",
      queryString.stringify(data),
      headers
    )
    .then((response) => {
      const access_token = response.data.access_token;
      res.send({
        access_token: access_token,
      });
    })
    .catch((error) => console.error("axios 3 3 3 3 3 3 3 3 axios", error));
});
console.log(`Listening on 3002`);
app.listen(3002);
