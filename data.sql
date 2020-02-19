DROP TABLE TreatmentLog;
DROP TABLE ArrivalLog;
DROP TABLE ResponseLog;
DROP TABLE AlarmLog;
DROP TABLE Users;

-- Table of Users
CREATE TABLE Users (
    ID serial PRIMARY KEY,
    MongoID varchar UNIQUE,
    Username varchar UNIQUE,
    LastLogin timestamptz
);

-- Details when Users start an alarm
CREATE TABLE AlarmLog (
    ID serial PRIMARY KEY,
    UserID varchar NOT NULL,
    AlarmStart timestamptz NOT NULL,
    AlarmEnd timestamptz,
    AlarmSent Boolean,
    FOREIGN KEY (UserID) REFERENCES Users(MongoID) ON DELETE CASCADE
);

-- Record responses of Users when they recieve an alert from a friend's alarm timeout
CREATE TABLE ResponseLog (
    ID serial PRIMARY KEY,
    ResponderID varchar NOT NULL,
    AlarmID Integer NOT NULL,
    AlertResponse Boolean NOT NULL,
    ResponseTime timestamptz NOT NULL,
    UNIQUE (ResponderID, AlarmID), -- users respond to an alert only once
    FOREIGN KEY (AlarmID) REFERENCES AlarmLog(ID) ON DELETE  CASCADE,
    FOREIGN KEY (ResponderID) REFERENCES Users(MongoID) ON DELETE CASCADE
);

-- Responders verify when they have arrived to help another user
CREATE TABLE ArrivalLog (
    ID serial PRIMARY KEY,
    ResponseID Integer NOT NULL UNIQUE, -- users arrive for an alert only once
    ArrivalTime timestamptz NOT NULL,
    FOREIGN KEY (ResponseID) REFERENCES ResponseLog(ID) ON DELETE CASCADE
);

-- Record if User was saved from an alarm timeout alert
CREATE TABLE TreatmentLog (
    ID serial PRIMARY KEY,
    ResponseID Integer NOT NULL,
    AlertSuccessful Boolean NOT NULL,
    TreatmentTime timestamptz NOT NULL,
    FOREIGN KEY (ResponseID) REFERENCES ResponseLog(ID) ON DELETE CASCADE
);

/* Uncomment section to fill database with example data
INSERT INTO Users (Username, MongoID, LastLogin) VALUES ('John', 'j', NOW());
INSERT INTO Users (Username, MongoID, LastLogin) VALUES ('Alice', 'a', '2020-01-30 09:45:00-05');
INSERT INTO Users (Username, MongoID, LastLogin) VALUES ('Bob', 'b', '2020-02-01 15:05:00-08');
INSERT INTO Users (Username, MongoID, LastLogin) VALUES ('Charlie', 'c', NOW());

INSERT INTO ALarmLog (UserID, AlarmStart, AlarmEnd, AlarmSent) VALUES ('j', NOW() - INTERVAL '2 minutes', NOW(), TRUE);
INSERT INTO ALarmLog (UserID, AlarmStart, AlarmEnd, AlarmSent) VALUES ('b', '2020-02-01 18:25:00-08', '2020-02-01 18:27:00-08', TRUE);
INSERT INTO ALarmLog (UserID, AlarmStart, AlarmEnd, AlarmSent) VALUES ('a', NOW() - INTERVAL '2 minutes', NOW(), FALSE);

INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES ('c', 1, FALSE, NOW());
INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES ('b', 1, TRUE, NOW());
INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES ('a', 1, TRUE, NOW());
INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES ('a', 2, TRUE, '2020-02-01 18:27:36-08');
INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES ('c', 2, TRUE, '2020-02-01 18:28:00-08');

INSERT INTO ArrivalLog (ResponseID, ArrivalTIme) VALUES (2, NOW() + INTERVAL '5 minutes');
INSERT INTO ArrivalLog (ResponseID, ArrivalTIme) VALUES (3, NOW() + INTERVAL '17 minutes');
INSERT INTO ArrivalLog (ResponseID, ArrivalTIme) VALUES (4, '2020-02-01 18:39:28-08');

INSERT INTO TreatmentLog (ResponseID, AlertSuccessful, TreatmentTime) VALUES (1, FALSE, NOW());
INSERT INTO TreatmentLog (ResponseID, AlertSuccessful, TreatmentTIme) VALUES (2, FALSE, NOW());
*/