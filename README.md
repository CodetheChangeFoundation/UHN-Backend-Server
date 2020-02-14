# UHN-Backend-Server

University Health Network API Endpoint Backend Server

## Setup

1. Install Node.js through online browser
2. Install MongoDB through online browser, specifically the MongoDB Community Server
3. Create a ".env" file with SECRET defined as one of the environment variables

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

### Run tests

Make sure you are in project directory and run

```(bash)
$ npm test
```

# Endpoint Documentation

## Getting responders of a user

GET "/users/:id/responders" :

HTTP Response:

```
{
    "Responders": [
        {
            "id": string,
            "username": string,
            "onlineStatus": boolean
        }
    ]
}
```

## Adding a responder to a user

POST "/users/:id/responders" :

Request Body:

```
{
    "respondersToAdd": [
        {"id": string},
        ...
    ]
}
```

HTTP Response:

```
{
    "respondersAdded": [
        {
            "id": string,
            "username": string,
            "onlineStatus": boolean
        }
        ...
    ]
}
```

## Deleting a responders from a user
DELETE "/users/:id/responders"

Request Body:
```
{
    "respondersToDelete": [
        {"id": string},
        ...
    ]
}
```


HTTP Response:

```
{
    "respondersDeleted": [
        {
            "id": string,
            "username": string
        }
        ...
    ]
}
```

## Getting Responder Count

GET "/user/:id/responders/count"

Supported Query Params:

```
"online": boolean // If true, returns number of online responders for this user
```

HTTP Response:

```
{
    "count": int
}
```

## Adding Help Request

POST "/help-request"

Request Body:

```
{
    "userId": string
}
```

HTTP Response:

```
{
    "id": string,
    "userId": string,
    "responderId": string || null (initialized, only filled when a responder accepts this request),
    "status": enum["open", "sent_to_responder", "taken", "arrived", "resolved"] (initialized to "open"),
    "responders: [
        { id: string }
        ...
    ],
    "createdAt": date,
    "updatedAt": date
}
```
## Adding Push Token

POST "/user/{id}/notifications"

Request Body:

```
{
    "pushToken": string
}
```

HTTP Response:

```
{
    "id": string,
    "pushToken": string
}
```
