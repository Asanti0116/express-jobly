# Jobly Backend

## General Information
This is the Express backend for Jobly, version 2.

Tech Stack Used:

    Node.js
    Express
    Jest + Supertest Library (testing)

To get started run the following commands in CLI:

    npm init
    npm install
    psql -f jobly.sql
    psql
        \connect jobly
        \i jobly-schema.sql
        \i jobly-seed.sql

To run the application:

    node server.js
    
To run the tests:

    jest -i


Application Structure:

    
>   Models folder handles SQL queries via a lightweight ORM. User/Job/Company models interact with the database and make modifying the SQL queries easier to manage. They also return the appropriate error messages related to possible data errors. 

>   Routes folder defines all API endpoints and the logic for handling requests and responses. 

>   Middleware folder contains functions for specific tasks like authentication & authorization. 

>   Helpers folder contains functions for JWT token generation & validation. It also contains a function for creating SQL queries for partial updates. 

>   Schemas folder contains JSON schemas which are validating against from the Routes. We return appropriate error messages to the user if the schema is violated. 

Testing Structure:

>   148 tests have been written to cover all models, routes, functions, and configurations for this API. Tests should be run inband (jest -i) to prevent race conditions & allow tests to be run sequentially. 


Authentication Security:

>   I used JWT based authentication to securely log in users and safely pass user data between endpoints and the server. I used middelware to ensure that users and admins can safely access the appropriate routes. 

Error Handling:

>   I used custom error classes, JSON schemas, and middleware to inform the user of any potential errors made while using the API. 

Improvements:

>   I'd like to add more security features for the application, technical skills needed for jobs, as well as technical skills for each user. I've also added simple to do lists at the bottom of some files for individual tasks I'd like to accomplish for that specific file. 

## API Usage Guide

### AUTHORIZATION ROUTES
To login as admin, POST to http://localhost:3001/auth/token

    Sample Admin login credentials:
    {
    "username": "testadmin",
    "password": "password"
    }

Copy/paste token to Auth Type "Bearer Token" for auth

    SAMPLE TOKEN - YOUR TOKEN WILL BE DIFFERENT
    {
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY4MDI4MTExOH0.j14bPEoXZf6dBdZq1HmaRfhuxUGtkCa7TaoOFmfYVIo"
    }

To register a new user send POST to http://localhost:3001/auth/register

    Sample new user:
    {
          "username": "new",
          "firstName": "first",
          "lastName": "last",
          "password": "password",
          "email": "new@email.com"
     }

### COMPANY ROUTES  
To create new company POST to http://localhost:3001/companies
<br>[admin token required]
    
    POST: http://localhost:3001/companies
    {
      "handle": "1new",
      "name": "New Co",
      "description": "New test company",
      "numEmployees": 10,
      "logoUrl": "http://new.img"
    }

To get list of companies, GET to http://localhost:3001/companies?minEmployees=0&maxEmployees=200
<br>[anonymous requests ok]

    Optional filters can be added or removed:
        minEmployees= any num
        maxEmployees= any num
        name = any string

To get request on specific company, GET to http://localhost:3001/companies/:handle
<br>[anonymous requests ok]

    Sample company get request:
    http://localhost:3001/companies/anderson-arias-morrow

To patch / delete a specific company, PATCH/DELETE to http://localhost:3001/companies/:handle
<br>[admin token required]

    PATCH: http://localhost:3001/companies/anderson-arias-morrow
    Sample patch request:
    {
	   "name": "anderson-arias-morrow-new"
    }

    DELETE: http://localhost:3001/companies/1new


### JOBS ROUTES  
To post new job, POST to http://localhost:3001/jobs
<br>[admin token required]

    {
      "title": "1New Job",
      "salary": 90000,
      "equity": 0.05,
      "companyHandle": "hall-davis"
    }
    
To get all jobs, GET to http://localhost:3001/jobs
<br>[anonymous requests ok]

    Sample get request:
    http://localhost:3001/jobs

To get job from job id, GET to http://localhost:3001/jobs/:id
<br>[anonymous requests ok]

    Sample get request:
    http://localhost:3001/jobs/204

To get job from company handle, GET to http://localhost:3001/jobs/companies/:handle
<br>[anonymous requests ok]

    Sample get request:
    http://localhost:3001/jobs/companies/hall-davis

To get job from job id, GET to http://localhost:3001/jobs/:jobid
<br>[anonymous requests ok]

    Sample get request:
    http://localhost:3001/jobs/56


To delete job from job id, DELETE to http://localhost:3001/jobs/:jobid
<br>[admin token required]

    Sample delete request:
    http://localhost:3001/jobs/206

### USER ROUTES  
To create a new user as admin, POST to http://localhost:3001/users
<br>[admin token required]

    {
        "username": "u-new",
        "firstName": "First-new",
        "lastName": "Last-newL",
        "password": "password-new",
        "email": "new@email.com",
        "isAdmin": false
    }

To post a new job application, POST to http://localhost:3001/users/:username/jobs/:jobid
<br>[admin or matching user required]

    Sample post job application request:
    http://localhost:3001/users/u-new/jobs/2

To get all users, GET to http://localhost:3001/users
<br>[admin token required]

    Sample get request:
    http://localhost:3001/users


To get specific user info, GET to http://localhost:3001/users/:username
<br>[admin or matching user required]

    Sample get request:
    http://localhost:3001/users/testuser

To update user info, PATCH to http://localhost:3001/users/:username
<br>[admin or matching user required]

    Sample patch request:
    http://localhost:3001/users/testuser
    {
		"email": "joel@joelburton.com"
    }

To delete user, DELETE to http://localhost:3001/users/:username
<br>[admin or matching user required]

    Sample delete request:
    http://localhost:3001/users/u-new