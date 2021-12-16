# grepwords-webinar
Code snippets from *BIG DATA KEYWORD RESEARCH WITH GREPWORDS* presented by
* Mike King @ipullrank
* John Murch @johnmurch
* Colt Sliva @signorColt
* Jeff Coyle @jeffrey_coyle

# Code Snippets

* proxy - Heroku app code for proxy request so you can inject grepwords data directly into GSC

* appscript - Code snippet for a Google sheet to enable the following command
```=search_volume("seo")```
**REQUIRES THE PROXY**

## Proxy
Be sure to rename env_sample to .env and update the APIKEY to the grepwords APIKEY so you can test it locally. When pushing to heroku, you will have to add an APIKEY envar via heroku dashboard for the app > Settings > Config Vars

### Proxy Setup

``` cd proxy ```
``` npm install ```
``` cp env_sample .env```
Edit .env with your grepwords API


## App Script
Be sure to change the BASEURL in the appscript.js file before you copy/paste into the Google Sheets App Script Editor. The example I show in the webinar is using a test one
 ```https://ipr-proxy.herokuapp.com```

## Questions

Questions/Comments/Help
Please reach out via twitter @johnmurch or @ipullrank