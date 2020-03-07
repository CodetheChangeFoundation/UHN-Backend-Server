
# Endpoint Documentation

Please be mindful of the sections I have created for the endpoints:
- Users
- Help Requests
- Metrics

Add new endpoint documentations to the respective section.

## Error Status Codes

Whenever there are multiple errors that can be thrown on an endpoint with the same http code (e.g. 400, 404, 500), the endpoint will also return an error status code. We will reference this list as `StatusCodes`
- `400100`: Field Error (e.g. Missing a field)
- `400111`: Duplicate Error (e.g. object already exists, responder already added)
- `400200`: Limit Reached Error (e.g. Maximum number of entries for a particular field was filled, 6 responders have already accepted the help request)

```
{
    "errors": [
        {
            "message": string
        }
    ],
    "statusCode": enum[StatusCodes]
}
```

## Users

### Getting responders of a user

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

### Adding a responder to a user

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

### Deleting a responders from a user

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

### Getting Responder Count

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

## Help Requests

### Adding Help Request

POST "/help-requests"

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

### Updating Help Request

PUT "/help-requests/:helpReqId"

Request Body:

```
{
	"newResponderId": string,
	"status": enum["open", "sent_to_responder", "taken", "arrived", "resolved"]
}
```
or separately

HTTP Response:

```
{
    "id": string,
    "userId": string,
    "responderIds":[
        { id: string }
        ...
    ],
    "status": enum["open", "sent_to_responder", "taken", "arrived", "resolved"] (initialized to "open"),
    "responders: [
        { id: string }
        ...
    ],
    "createdAt": date,
    "updatedAt": date
}
```

### Getting Number of Responders

GET "/help-requests/:helpReqId/responders/count"

HTTP Response:

```
{
    "count": int
}
```


### Adding Push Token

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

## Metrics

### Adding Alarm Metric Log

POST "/metrics/alarm"

Request Body:

```
{
    "userID": string, // Mongo ID
    "startTime": string, // get UTC string with: new Date().toUTCString()
    "endTime": string // get UTC string with: new Date().toUTCString()
}
```

HTTP Response:

```
{
    "alarmID": integer // keep returned id for future log updates
    "userID": string,
    "startTime": string,
    "endTime": string
}
```

### Update Alarm Log Properties

PUT "/metrics/alarm/:alarmID"

Request Body:

```
{// requires one of sentStatus or newEndTime but also supports updating both at once
    "sentStatus": boolean,
    "newEndTime": string // get UTC string with: new Date().toUTCString()
}
```

HTTP Response:

```
{// returns alarmStatus if sentStatus was in body, same for alarmEnd and newEndTime
    "alarmID": integer,
    "alarmStatus": boolean,
    "alarmEnd": string
}
```
## Add Response Metric Log

POST "/metrics/response"

Request Body:

```
{
    "userID": string, // MongoID
    "alarmID": integer,
    "response": boolean,
    "responseTime": string // get UTC string with: new Date().toUTCString()
}
```

HTTP Response:

```
{
    "id": integer, // keep returned ID for future arrival and treatment logs
    "userID": string,
    "alarmID": integer,
    "response": boolean,
    "responseTime": string
}
```

## Add Arrival Metric Log

POST "/metrics/arrival"

Request Body:

```
{
    "responseID": integer,
    "arrivalTime": string // get UTC string with: new Date().toUTCString()
}
```

HTTP Response:

```
{
    "id": integer,
    "responseID": integer,
    "arrivalTime": string
}
```

## Add Treatment Metric Log

POST "/metrics/treatment"

Request Body:

```
{
    "responseID": integer,
    "alarmSuccess": boolean,
    "treatmentTime": string // get UTC string with: new Date().toUTCString()
}
```

HTTP Response:

```
{
    "id": integer,
    "responseID": integer,
    "alarmSuccess": boolean,
    "treatmentTime": string
}
```