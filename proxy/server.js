// Pass in Envars
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const axios = require("axios").default;
const corsAnywhere = require("cors-anywhere");
const express = require("express");
const path = require("path");
const apicache = require("apicache");
const expressHttpProxy = require("express-http-proxy");

const CORS_PROXY_PORT = 9000;

// Create CORS server
corsAnywhere.createServer({}).listen(CORS_PROXY_PORT, () => {
  console.log(`Proxy CORS server started at port ${CORS_PROXY_PORT}`);
});

const options = {
  root: path.join(__dirname),
};

// Create express Cache server
let app = express();
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

/* 
PROXY REQUEST FOR KEYWORD SEARCH VOLUME
REQUIRES GREPWORDS API KEY
 */
app.get("/keyword", async function (req, res) {
  try {
    let query = req.query.q;
    await axios
      .post(
        "https://data.grepwords.com/v1/keywords/lookup",
        {
          term: query,
        },
        {
          headers: {
            contentType: "application/json",
            api_key: process.env.APIKEY,
          },
        }
      )
      .then((resp) => {
        let payload = [];
        if (resp.data) {
          if (resp.data && resp.data.data.history) {
            payload = resp.data.data.history.reverse();
          }
          res.status(200).send(payload);
        } else {
          // nothing found return empty
          res.status(200).send(payload);
        }
      });
  } catch (e) {
    console.log("e", e);
    res.status(403).send({ status: "failed" });
  }
});
app.post("/slack/sv", async function (req, res) {
  try {
    let slackPayload = req.body;
    let query = slackPayload.text;
    await axios
      .post(
        "https://data.grepwords.com/v1/keywords/lookup",
        {
          term: query,
        },
        {
          headers: {
            contentType: "application/json",
            api_key: process.env.APIKEY,
          },
        }
      )
      .then(async (resp) => {
        let payload = [];
        let fields = [];
        if (resp.data) {
          if (resp.data && resp.data.data.history) {
            payload = resp.data.data.history.reverse();
            // override
            payload = payload
              .map((h) => {
                if (h.volume && h.date.split("-")[1] == "2021") {
                  return h;
                } else {
                  return "";
                }
              })
              .filter((e) => e);

            // add search volume and cpc to response
            fields.push(
              {
                type: "plain_text",
                text: "Keyword",
              },
              {
                type: "mrkdwn",
                text: resp.data.data.keyword.toString() || "",
              },
              {
                type: "plain_text",
                text: "Search Volume",
              },
              {
                type: "mrkdwn",
                text: resp.data.data.volume.toString() || "",
              },
              {
                type: "plain_text",
                text: "CPC",
              },
              {
                type: "mrkdwn",
                text: resp.data.data.cpc.toString() || "",
              }
            );
          }
          // provide slack payload back to them to make it pretty
          let override = {
            blocks: [
              {
                type: "section",
                fields: fields,
              },
            ],
          };
          res.status(200).send(override);
        } else {
          // nothing found return empty
          res.status(200).send(payload);
        }
      });
  } catch (e) {
    console.log("e", e);
    res.status(403).send({ status: "failed" });
  }
});
app.get("/*", cacheMiddleware());
app.options("/*", cacheMiddleware());

// Proxy to CORS server when request misses cache
app.use(expressHttpProxy(`localhost:${CORS_PROXY_PORT}`));

const APP_PORT = process.env.PORT || 8080;
app.listen(APP_PORT, () => {
  console.log(`CORS cache server started at port ${APP_PORT}`);
});

/**
 * Caching Middleware
 */
function cacheMiddleware() {
  const cacheOptions = {
    statusCodes: {
      include: [200],
    },
    defaultDuration: 60000,
    appendKey: (req, res) => req.method,
  };
  let cacheMiddleware = apicache.options(cacheOptions).middleware();
  return cacheMiddleware;
}
