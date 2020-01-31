DROP TABLE TreatmentLog;
DROP TABLE ArrivalLog;
DROP TABLE ResponseLog;
DROP TABLE AlarmLog;
DROP TABLE Users;

-- Table of Users
CREATE TABLE Users (
    ID serial PRIMARY KEY,
    Username varchar,
    Email varchar UNIQUE,
    LastLogin timestamptz
);

-- Details when Users start an alarm
CREATE TABLE AlarmLog (
    ID serial PRIMARY KEY,
    UserID Integer NOT NULL,
    AlarmStart timestamptz NOT NULL,
    AlarmTimeout timestamptz NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE
);

-- Record responses of Users when they recieve an alert from a friend's alarm timeout
CREATE TABLE ResponseLog (
    ID serial PRIMARY KEY,
    ResponderID Integer NOT NULL,
    AlarmID Integer NOT NULL,
    AlertResponse Boolean NOT NULL,
    ResponseTime timestamptz NOT NULL,
    UNIQUE (ResponderID, AlarmID), -- users respond to an alert only once
    FOREIGN KEY (AlarmID) REFERENCES AlarmLog(ID) ON DELETE  CASCADE,
    FOREIGN KEY (ResponderID) REFERENCES Users(ID) ON DELETE CASCADE
);

-- Responders verify when they have arrived to help another user
CREATE TABLE ArrivalLog (
    ID serial PRIMARY KEY,
    ResponseID Integer NOT NULL,
    ArrivalTime timestamptz NOT NULL,
    FOREIGN KEY (ResponseID) REFERENCES ResponseLog(ID) ON DELETE CASCADE
);

-- Record if User was saved from an alarm timeout alert
CREATE TABLE TreatmentLog (
    ID serial PRIMARY KEY,
    AlarmID Integer NOT NULL,
    AlertSuccessful Boolean NOT NULL,
    FOREIGN KEY (AlarmID) REFERENCES ALarmLog(ID) ON DELETE CASCADE
);

/* Uncomment section to fill database with example data
INSERT INTO Users (Username, Email, LastLogin) VALUES ('John', 'john@example.com', NOW());
INSERT INTO Users (Username, Email, LastLogin) VALUES ('Alice', 'alice@test.com', '2020-01-30 09:45:00-05');
INSERT INTO Users (Username, Email, LastLogin) VALUES ('Bob', 'bob@test.com', '2020-02-01 15:05:00-08');
INSERT INTO Users (Username, Email, LastLogin) VALUES ('Charlie', '1234@example.com', NOW());

INSERT INTO ALarmLog (UserID, AlarmStart, AlarmTimeout) VALUES (1, NOW() - INTERVAL '2 minutes', NOW());
INSERT INTO ALarmLog (UserID, AlarmStart, AlarmTimeout) VALUES (3, '2020-02-01 18:25:00-08', '2020-02-01 18:27:00-08');

INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES (4, 1, FALSE, NOW());
INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES (3, 1, TRUE, NOW());
INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES (2, 1, TRUE, NOW());
INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES (2, 2, TRUE, '2020-02-01 18:27:36-08');
INSERT INTO ResponseLog (ResponderID, AlarmID, AlertResponse, ResponseTime) VALUES (4, 2, TRUE, '2020-02-01 18:28:00-08');

INSERT INTO ArrivalLog (ResponseID, ArrivalTIme) VALUES (2, NOW() + INTERVAL '5 minutes');
INSERT INTO ArrivalLog (ResponseID, ArrivalTIme) VALUES (3, NOW() + INTERVAL '17 minutes');
INSERT INTO ArrivalLog (ResponseID, ArrivalTIme) VALUES (4, '2020-02-01 18:39:28-08');

INSERT INTO TreatmentLog (AlarmID, AlertSuccessful) VALUES (1, FALSE);
INSERT INTO TreatmentLog (AlarmID, AlertSuccessful) VALUES (2, FALSE);
*/