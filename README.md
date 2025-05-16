**Note: RPG Ambience is no longer in active development. Please [read the announcement](https://blog.ambience.tabletopsoftware.net/articles/rpg-ambience-future/) for details. For information on hosting your own version of RPG Ambience, please [read the instructions below](#hosting-your-own-copy-of-rpg-ambience).**

# RPG Ambience

*Bring your game to life with music and visuals*

RPG Ambience is a media player that enables roleplayers to bring their sessions to life using sound and visuals. It is free software that runs directly in your browser.

[» Try RPG Ambience](http://rpg-ambience.com/)

For instructions on how to use RPG Ambience, consult the help document inside the application.

## Hosting your own copy of RPG Ambience
If you want full control over the application, or if [`app.rpg-ambience.com`](http://app.rpg-ambience.com/) ever goes offline, you can host your own copy of the application. As of August 2018, here's how you do it:

- Download the [latest deployed source files in the `live` folder](https://github.com/JakobKallin/RPG-Ambience/tree/master/live). The other source files in the repo, including those in other branches, may not be up-to-date with the latest version of RPG Ambience actually deployed.
- Create a Google account (or use your existing account) and enable the Google Drive API and the Google Drive SDK in the [Google Developers Console](https://console.developers.google.com/).
- Make the following modifications to [`source/GoogleDriveBackend.js`](https://github.com/JakobKallin/RPG-Ambience/blob/gh-pages/source/GoogleDriveBackend.js):
  - Replace `907013371139` with the app ID from your Google Drive API settings.
  - Replace `AIzaSyCTT934cGu2bDRbCUdx1bHS8PKT5tE34WM` with the API key from your Google Drive API settings.
- Serve the files using a standard web server like [Apache](https://httpd.apache.org/) or [Lighttpd](http://www.lighttpd.net/), or with a service like [GitHub Pages](https://pages.github.com/).
- Add your server's hostname (possibly `localhost`) to the list of authorized JavaScript origins in your Google Drive API settings.

After following these steps, your copy of RPG Ambience should work just like the official one, only with a different account providing the Google Drive integration.

*I have not tested the steps above and may have missed some step. If the instructions don't work for you, please let me know.*
