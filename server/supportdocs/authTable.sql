create database pocdatabase;

/*use pocdatabase;
DROP TABLE auth;*/
/*use pocdatabase;
Truncate table auth;*/

use pocdatabase;
CREATE TABLE auth (
    CustomerId int NOT NULL,
    UserEmail varchar(255) NOT NULL ,
    UserName varchar(255) NOT NULL,
    UserPassword varchar(255) NOT NULL,
    TempPassword varchar(255),
    OldPasswords varchar(255),
    PRIMARY KEY (CustomerId),
    UNIQUE (UserEmail, UserName)
);

use pocdatabase;
INSERT INTO auth
VALUES (101, 'vikas.sarkar2289@gmail.com', 'vikassarkar', 'Amdocs@1234');

use pocdatabase;
INSERT INTO auth
VALUES (102, 'pooja.rathore@amdocs.com', 'poojarathore', 'Amdocs@1234');

use pocdatabase;
INSERT INTO auth
VALUES (103, 'maria.anders@gmail.com', 'maria.anders', 'Amdocs@1234');

use pocdatabase;
INSERT INTO auth
VALUES (104, 'ana.trujillo@gmail.com', 'ana.trujillo', 'Amdocs@1234');

use pocdatabase;
INSERT INTO auth
VALUES (105, 'antonio.moreno@gmail.com', 'antonio.moreno', 'Amdocs@1234');

use pocdatabase;
INSERT INTO auth
VALUES (106, 'thomas.hardy@gmail.com', 'thomas.hardy', 'Amdocs@1234');

use pocdatabase;
INSERT INTO auth
VALUES (107, 'christina.berglund@gmail.com', 'christina.berglund ', 'Amdocs@1234');

use pocdatabase;
INSERT INTO auth
VALUES (108, 'vikas.jadev@gmail.com', 'vikas.jadev', 'Amdocs@1234');

use pocdatabase;
DELETE FROM auth
WHERE CustomerId = 110;

use pocdatabase;
ALTER TABLE auth
ADD OldPasswords varchar(255);

use pocdatabase;
UPDATE auth
SET OldPasswords = '$2a$10$66XOcD7zwxqHYrrf6ShhZewPfFWJfEx0xYT0gPK.BFHIhppamdSgC___$2a$10$66XOcD7zwxqHYrrf6ShhZewPfFWJfEx0xYT0gPK.BFHIhppamdSgC'
WHERE CustomerId = 9;

use pocdatabase;
select * from auth;

SELECT * FROM auth ORDER BY CustomerId DESC LIMIT 1;
