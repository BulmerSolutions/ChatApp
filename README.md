# ChatApp
This is a basic chat application which you and your friends can connect and start chatting!

## The Server

The ChatApp server is run on a node js web server and uses a mySQL database for users and chat logs. To run the server you must make sure everything in the `config.json` file is filled out and correct! Once the server is ready to go, change your directory to the server folder and run `node server.js`, you should now see the app starting up and the app connecting to the database! To test the app, go to your browser and type the URL and port of your application and it should show up, the default url for port 5000 is `http://localhost:5000`. 

Here is a preview of the config file found in the server folder:

    {
      "port": 5000,
      "secret": "Your secret key for secure session",
      "mysql": {
        "url": "",
        "user": "",
        "password": "",
        "database": "chatapp"
      },
      "google": {
        "clientID": "CLIENT ID",
        "clientSecret": "CLIENT SECRET"
      }
    }

### Server Settings

You may change the port of the server from `5000` to what ever you would prefer it to be. The secret **MUST** be a key that no one knows so your user's passwords can not be found and Socket IO chat is kept secure.

### Database Setup

For your mySQL server, you will need to have a database/schema pre-defined and the ChatApp server will make the tables and do the nit-picky work. Make sure the `url` is set to your database's ip address / url, i.e. `"url": "localhost",`. Your username and password for the app must be correct and allows the app to make changes to the database. And finally if you'd like the app to use your database for your website (or just use a diffrent name) you can change chatapp `"database": "chatapp"` to the name of the database you would like to use.

***Warning: if you use your database and not the database the server makes, you may run into issues!***

### Google Sign In Setup

The sign in is very simple, just add your app's client id and client secret and every thing will work fine.

If you need help setting this up, go to https://developers.google.com/identity/sign-in/web/devconsole-project and follow the steps to make the google app. The call back url is `http://localhost:5000/login/google/callback` unless you changed the port in the config file, if so change `5000` to the port to changed it to. If you are using a domain name, replace `localhost` with your domain name. Make sure that the port is forwarded to the computer serving the app.

## The Application

The app is run off of electron, to run the app, install electron and run `electron .` in the app directory. Electron will pick up the package.json file and run the app from it. 

Soon the built applications will be posted to Google Drive to download for easier use.
