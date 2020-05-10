# UHN-Backend-Server

University Health Network API Endpoint Backend Server

## Setup

1. Install Node.js through online browser
2. Install MongoDB through online browser, specifically the MongoDB Community Server
3. Create a ".env" file with SECRET defined as one of the environment variables
4. In ".env", define DATABASE_URL with format: `"postgresql://<username>:<password>@<host>:5432/UHN-metrics"`

## Run

### Starting the MongoDB Server

1. Open command prompt from start on local PC (assuming windows setup)
2. Type "cd ..." and replace "..." with the bin folder directory within where mongoDB is installed
3. Run "mongo.exe"

### Starting Redis

1. Download Redis using wget (Windows: wsl, Mac/Linux: terminal). Use version 5.0.6

```(bash)
$ wget http://download.redis.io/releases/redis-5.0.6.tar.gz
```

2. Unzip tar file

```(bash)
$ tar xzf redis-5.0.6.tar.gz
```

3. Make project

```(bash)
$ cd redis-5.0.6
$ make
```

4. Run Redis server, leave process opened

```(bash)
$ src/redis-server
```

### Starting the Express server

Make sure you are in project directory and run, it will automatically detect any changes and refresh when necessary

```(bash)
$ npm start
```

### Starting PostgreSQL Metrics Database
1. [Download](https://www.postgresql.org/download/) and install Postgres 12 (Older versions cannot use Postgres 12 databases). Remember superuser password.

2. Make sure your system environment variables contain the PATH to the "bin" folder in PostgresQL's install location, or else "pg_ctl" command may not be found.

3. Start server with `pg_ctl -D "PathToPostgresInstall" start` 

    (Default windows path: "C:/Program Files/PostgreSQL/12/data")

    Stop server with `pg_ctl -D "PathToPostgresInstall" stop`

4. Once server has started, enter postgres CLI with superuser account 'postgres' `psql postgres postgres`. Enter your superuser password when prompted. 

5. Create database called "UHN-metrics" `CREATE DATABASE "UHN-metrics";`

6. Create user named metric with password pwctcuhn `CREATE ROLE metric WITH LOGIN PASSWORD 'pwctcuhn';`

7. Logout from postgres server and enter following command in the root directory to initalize database `psql --username=metric UHN-metrics < data.sql`

To fill database with example data, uncomment bottom statements in data.sql and run command from step 7.

For help with DATABASE_URL fields, go to root directory, connect to postgres with `psql --username=metric UHN-metrics` and enter `\conninfo`


### Set Up OAuth + Gmail for Data Analytics
## Getting credentials.json
1. Go to the [Google Developer Console](https://developers.google.com/gmail/api/quickstart/nodejs) and click "Enable the Gmail API".

2. Select `Web Server` from the dropdown.

3. Enter this link `https://developers.google.com/oauthplayground` in the "Authorized Redirect URIs" field.

4. Download the client configuration to get `credentials.json`

## Getting OAuth Tokens

1. Go to https://developers.google.com/oauthplayground and open the settings menu on the right.

2. Check the box labelled `Use your own OAuth credentials` and enter the OAuth Client ID and OAuth Client Secret provided in the saved `credentials.json` file.

3. Go to the `Step 1: Select and authorize APIs` section on the left. Enter the URL `https://mail.google.com` in the field below and click `Authorize APIs`.

4. Go to `Step 2: Exchange authorization code for tokens` and click the button labelled `Exchange authorization code for tokens`.

5. Save the Refresh and Access tokens.

## Setting Up The .env File

Create the following variables:

    `
    METRIC_DATA_SERVICE="gmail"
    METRIC_DATA_USER="Gmail account used from the setup above"
    METRIC_DATA_CLIENTID="Provided in credentials.json" 
    METRIC_DATA_CLIENT_SECRET="Provided in credentials.json"
    METRIC_DATA_REFRESH_TOKEN="Saved from OAuth playground"
    METRIC_DATA_ACCESS_TOKEN="Saved from OAuth playground"
    METRIC_DATA_RECEIVER="Account to receive analytics"
    `

## Run tests

Make sure you are in project directory and run

```(bash)
$ npm test
```

## Migrations

1. Remove email field: `db.users.update({}, {$unset: {email: true}}, {multi: true, safe: true}) `
