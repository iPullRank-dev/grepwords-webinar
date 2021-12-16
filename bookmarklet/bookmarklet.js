/*
@CHANGEME - APIKEY - api key from grepwords
@CHANGEME - KEYWORDLIMIT - number of keywords you want to process e.g. 25, 100, max is 1000 for GSC
@CHANGEME - BASEURL - Proxy Endpoint (heroku app)

Once the XXXX values have been changed, you can copy/paste into bookmarklet creator like https://chriszarate.github.io/bookmarkleter to create a bookmarklet
I recommend naming it GSC - 25 and setting KEYWORDLIMIT to 25, then create GSC - 100 and setting KEYWORDLIMIT to 100
*/
const APIKEY = "XXXX";
const KEYWORDLIMIT = 25;
const BASEURL = "https://XXXX.herokuapp.com";

const XPATH_LOOKUP = getXPathForElement(document.querySelector("table"));

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function getElementByXpath(path) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

function getXPathForElement(element) {
  const idx = (sib, name) =>
    sib
      ? idx(sib.previousElementSibling, name || sib.localName) +
        (sib.localName == name)
      : 1;
  const segs = (elm) =>
    !elm || elm.nodeType !== 1
      ? [""]
      : elm.id && document.getElementById(elm.id) === elm
      ? [`id("${elm.id}")`]
      : [
          ...segs(elm.parentNode),
          `${elm.localName.toLowerCase()}[${idx(elm)}]`,
        ];
  return segs(element).join("/");
}

function createCell(cell, text, style) {
  var div = document.createElement("div"), // create DIV element
    txt = document.createTextNode(text); // create text node
  div.appendChild(txt); // append text node to the DIV
  div.setAttribute("style", style); // set DIV style attribute
  cell.appendChild(div); // append DIV to the table cell
}

function appendColumn(header, data, field, style) {
  var tbl = getElementByXpath(XPATH_LOOKUP), // table reference
    i;
  // open loop for each row and append cell
  for (i = 0; i < tbl.rows.length; i++) {
    if (i == 0) {
      createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), header, "");
    } else {
      let kw = tbl.rows[i].cells[0].innerText;
      if (data[kw] && data[kw][field]) {
        createCell(
          tbl.rows[i].insertCell(tbl.rows[i].cells.length),
          data[kw][field],
          style
        );
      } else {
        createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), "", style);
      }
    }
  }
}

function getKeywords(limit = 10) {
  let keywords = [];
  let tbl = getElementByXpath(XPATH_LOOKUP);
  var targetTDs = tbl.querySelectorAll("tr > td:first-child");
  let lmt = targetTDs.length > limit ? limit : targetTDs.length;
  let i = 0;
  [...Array(lmt)].forEach(() => {
    var td = targetTDs[i];
    i++;
    keywords.push(td.innerText);
  });
  return keywords;
}

// get keyword, click, impressions
function getKeywordData(limit = 1000) {
  let keywords = [];
  let tbl = getElementByXpath(XPATH_LOOKUP);
  var targetTDs = tbl.querySelectorAll("tr > td:first-child");
  var targetTDClick = tbl.querySelectorAll("tr > td:nth-child(2)");
  var targetTDImpressions = tbl.querySelectorAll("tr > td:nth-child(3)");
  let lmt = targetTDs.length > limit ? limit : targetTDs.length;
  let i = 0;
  [...Array(lmt)].forEach(() => {
    var td = targetTDs[i];
    var tdc = targetTDClick[i];
    var tdi = targetTDImpressions[i];
    i++;
    keywords.push({
      keyword: td.innerText,
      clicks: tdc.innerText,
      impressions: tdi.innerText,
    });
  });
  return keywords;
}

async function enhanceReport(_keywordData) {
  let style =
    "font: 12px Roboto,RobotoDraft,Helvetica,Arial,sans-serif;margin-left:2rem; margin-right:2rem;";
  appendColumn("Volume", _keywordData, "volume", style);
  appendColumn("CPC", _keywordData, "cpc", style);
}

//copy /paste
async function fetchKeywordData(keyword) {
  const data = {
    term: keyword,
  };
  // proxy request due to cors - handle not found cases
  let resp = await fetch(
    BASEURL + "/https://data.grepwords.com/v1/keywords/lookup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: APIKEY,
      },
      body: JSON.stringify(data),
    }
  )
    .then((r) => r.json())
    .catch((e) => {
      return null;
    });

  if (resp && resp.data) {
    return resp.data;
  } else {
    return null;
  }
}
// GSC requires TRUST!
let escapeHTMLPolicy = trustedTypes.createPolicy("forceInner", {
  createHTML: (to_escape) => to_escape,
});

async function run() {
  let keywords = await getKeywords(KEYWORDLIMIT);
  console.log("*keywords*", keywords);

  /* SPINNER INJECTION 3000 */
  // Load Style
  var style = document.createElement("style");
  style.innerHTML = escapeHTMLPolicy.createHTML(
    `/* Absolute Center Spinner */ .loading { position: fixed; z-index: 999; height: 2em; width: 2em; overflow: show; margin: auto; top: 0; left: 0; bottom: 0; right: 0; visibility: hidden; } /* Transparent Overlay */ .loading:before { content: ''; display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.3); } /* :not(:required) hides these rules from IE9 and below */ .loading:not(:required) { /* hide "loading..." text */ font: 0/0 a; color: transparent; text-shadow: none; background-color: transparent; border: 0; } .loading:not(:required):after { content: ''; display: block; font-size: 10px; width: 1em; height: 1em; margin-top: -0.5em; -webkit-animation: spinner 1500ms infinite linear; -moz-animation: spinner 1500ms infinite linear; -ms-animation: spinner 1500ms infinite linear; -o-animation: spinner 1500ms infinite linear; animation: spinner 1500ms infinite linear; border-radius: 0.5em; -webkit-box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.5) -1.5em 0 0 0, rgba(0, 0, 0, 0.5) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0; box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) -1.5em 0 0 0, rgba(0, 0, 0, 0.75) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0; } /* Animation */ @-webkit-keyframes spinner { 0% { -webkit-transform: rotate(0deg); -moz-transform: rotate(0deg); -ms-transform: rotate(0deg); -o-transform: rotate(0deg); transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); -ms-transform: rotate(360deg); -o-transform: rotate(360deg); transform: rotate(360deg); } } @-moz-keyframes spinner { 0% { -webkit-transform: rotate(0deg); -moz-transform: rotate(0deg); -ms-transform: rotate(0deg); -o-transform: rotate(0deg); transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); -ms-transform: rotate(360deg); -o-transform: rotate(360deg); transform: rotate(360deg); } } @-o-keyframes spinner { 0% { -webkit-transform: rotate(0deg); -moz-transform: rotate(0deg); -ms-transform: rotate(0deg); -o-transform: rotate(0deg); transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); -ms-transform: rotate(360deg); -o-transform: rotate(360deg); transform: rotate(360deg); } } @keyframes spinner { 0% { -webkit-transform: rotate(0deg); -moz-transform: rotate(0deg); -ms-transform: rotate(0deg); -o-transform: rotate(0deg); transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); -ms-transform: rotate(360deg); -o-transform: rotate(360deg); transform: rotate(360deg); } }`
  );
  var ref = document.querySelector("script");
  ref.parentNode.insertBefore(style, ref);
  // Load Spinner
  var elemDiv = document.createElement("div");
  elemDiv.id = "loading";
  elemDiv.className = "loading";
  document.body.appendChild(elemDiv);
  // Start Spinning
  var loadingDiv = document.getElementById("loading");
  loadingDiv.style.visibility = "visible";

  // loop all keywords with limit and delay!
  let KeywordSearchVolume = {};
  for await (k of keywords) {
    console.log("Fetching: ", k);
    await sleep(1000);
    let keywordData = await fetchKeywordData(k);
    if (keywordData) {
      console.log(k, keywordData);
      KeywordSearchVolume[k] = keywordData;
      if (KeywordSearchVolume[k].cpc) {
        // override and round up
        KeywordSearchVolume[k].cpc = parseFloat(
          KeywordSearchVolume[k].cpc
        ).toFixed(2);
      }
    }
  }
  console.log("done", KeywordSearchVolume);
  // append volume and cpc column
  await enhanceReport(KeywordSearchVolume);
  loadingDiv.style.visibility = "hidden";

  // Let's Go!
}

run();
