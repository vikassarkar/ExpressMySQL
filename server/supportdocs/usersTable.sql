create database pocdatabase;

/*use pocdatabase;
DROP TABLE users;*/
/*use pocdatabase;
Truncate table users;*/

use pocdatabase;
CREATE TABLE users (
    CustomerId int NOT NULL,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    PhoneNumber varchar(14) NOT NULL,
    Address varchar(255),
    City varchar(255) NOT NULL,
    PostalCode varchar(50) NOT NULL,
    Country varchar(255) NOT NULL,
    AlternatePhoneNumber varchar(14),
    DateOfBirth date NOT NULL,
    Gender varchar(10) NOT NULL,
    IsDeleted boolean,
    PRIMARY KEY (CustomerId)
);

use pocdatabase;
INSERT INTO users
VALUES (101, 'Sarkar', 'Vikas', '91-9405728836', 'alcon silverlleaf keshavnagar', 'Pune', '411013', 'India', null, '1960-01-02', 'm', false);

use pocdatabase;
INSERT INTO users
VALUES (102, 'Rathore', 'Pooja', '91-7276220320', 'Pleasent park fatimanagar', 'Pune', '411023', 'India', null, '1960-01-02', 'f', false);

use pocdatabase;
INSERT INTO users
VALUES (103, 'Anders', 'Maria', '045-5512345678', 'Obere Str. 57', 'Berlin', '12209', 'Germany', null, '1960-01-02', 'm', false);

use pocdatabase;
INSERT INTO users
VALUES (104, 'Trujillo', 'Ana', '044-5512345678', 'Avda. de la Constitución 2222', 'México D.F.', '05021', 'Mexico', null, '1960-01-02', 'm', false);

use pocdatabase;
INSERT INTO users
VALUES (105, 'Moreno', 'Antonio', '91-7709308837', 'Mataderos 2312', 'México D.F.', '05023', 'Mexico', null, '1960-01-02', 'm', false);

use pocdatabase;
INSERT INTO users
VALUES (106, 'Hardy', 'Thomas', '44-7700900077', '120 Hanover Sq.', 'London', 'WA1 1DP', 'UK', null, '1960-01-02', 'm', false);

use pocdatabase;
INSERT INTO users
VALUES (107, 'Berglund', 'Christina ', '46-77179333', 'Berguvsvägen 8', 'Luleå', 'S-958 22', 'Sweden', null, '1960-01-02', 'm', false);

use pocdatabase;
INSERT INTO users
VALUES (108, 'Jadev', 'Vikas', '91-9943564321', 'mahavir nagar', 'Indore', '421031', 'India', null, '1960-01-02', 'm', false);

use pocdatabase;
UPDATE users
SET Gender = 'm', IsDeleted = false
WHERE CustomerID = 109;

/*YYYY-MM-DD*/
use pocdatabase;
UPDATE users
SET DateOfBirth = DATE('1960-01-02')
WHERE CustomerID = 10;

/*Gender varchar(10) NOT NULL,
IsDelete boolean*/

use pocdatabase;
ALTER TABLE users
ADD DateOfBirth date;

use pocdatabase;
ALTER TABLE users
DROP COLUMN Age;

use pocdatabase;
ALTER TABLE users
ADD AlternatePhoneNumber varchar(14);

use pocdatabase;
ALTER TABLE users
CHANGE Isdelete IsDeleted boolean;

use pocdatabase;
DELETE FROM users
WHERE CustomerId = 110;

use pocdatabase;
select * from users;
