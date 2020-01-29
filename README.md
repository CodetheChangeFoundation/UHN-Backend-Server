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

### Endpoint Documentation

## Adding Responders to a user
POST "/users/:id/responders" :
```
responders added in request of form:
{
"respondersToAdd": [{"id": "insertIDhere"},{"id": "insert2ndIDhere"}]
}
```

HTTP Response:
```
{
    "respondersAdded": [
        {
            "id": "xxxx",
            "username": "xxx",
            "onlineStatus": true/false
        }
    ]
}
```


## Toggling Online Status
POST "/users/:id/status":

```
{
"request": "online"
}
or
{
"request" : offline
}
```

## Getting Responders of a user
GET "/users/:id/responders" :

HTTP Response:
```
{
    "Responders": [
        {
            "id": "5e3110e483ea5e2e6c7a62c0",
            "username": "userB",
            "onlineStatus": false
        }
    ]
}
```
