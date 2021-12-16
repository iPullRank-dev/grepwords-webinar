/*
  1. Create a new Google Sheet
  2. Open Extensions > App Script
  3. Replace code and paste in below
  4. Go back to sheet and change a ceil's value to  =search_volume("seo")
  5. Bonus: Add a sparkline, adjust the data range but paste into ceil =SPARKLINE(A3:A13,{"charttype","column";"highcolor","red"})
  */

function search_volume(q) {
  // @CHANGEME - CHANGE BASEURL TO YOUR ENDPOINT
  const BASEURL = "https://XXXX.herokuapp.com";

  var url = BASEURL + "/keyword?q=" + encodeURIComponent(q);
  var response = UrlFetchApp.fetch(url);
  var objects = JSON.parse(response.getContentText());

  // Remove null volume values and limit to only 2021 dates
  objects = objects
    .map((h) => {
      if (h.volume && h.date.split("-")[1] == "2021") {
        return h;
      } else {
        return "";
      }
    })
    .filter((e) => e);

  var s = SpreadsheetApp.getActiveSpreadsheet();
  var ss = s.getActiveSheet();
  var sc = ss.getActiveCell();

  var outputRows = [];
  var headings = ["volume", "date"];

  objects.forEach(function (item) {
    outputRows.push(
      headings.map(function (heading) {
        return item[heading] || "";
      })
    );
  });

  return outputRows;
}
