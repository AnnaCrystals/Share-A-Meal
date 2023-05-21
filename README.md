## Share-A-Meal-API-P4



## Description

Share-A-Meal-API-P4
Is an programming assignment for semester 4 of year 1 Informatica on Avans Hogeschool.

On this application can see, update, delete and insert users.

Those users can see, update, delete and insert meals.
With this application you can save users and meals and see and change their data with the proper permissions like login.


## Installation

1. Clone this repository to your local machine.
2. Install the dependencies by running npm install.
3. Set up the necessary environment variables. Refer to the .env.example file for the required variables.
4. Start the API server by running node app.js .
5. The API will be accessible at http://localhost:3000.

## Usage

Once you have the server running locally, you can start up your webbrowser and navigate to **localhost:3000**

-Navigation towards login: **localhost:3000/api/login**

===================================================================

To login it's necessary to use POSTMAN Using a POST including the emailAdress and password of the user.

===================================================================

-Navigation towards creating an user: **localhost:3000/api/user**

-Navigation towards all users: **localhost:3000/api/user**

-Navigation towards user profile: **localhost:3000/api/user/profile**

-Navigation towards specific user: **localhost:3000/api/user/1**

-Navigation towards delete, update user: **localhost:3000/api/user/1**

===================================================================

To create an user it's necessary to use POSTMAN.
-Send a POST for the user

To see all the users it's not necessary to use POSTMAN but you can use it.
-Send a GET for all the users

To see the user profile it's necessary to be logged in nad use POSTMAN and be the user.
-Send a GET for your profile

To get an specific user it's necessary to be logged in and use POSTMAN and be the user.
-Send a GET for the user

To update or delete an user it's necessary to be logged in and use POSTMAN and be the user.
-Send a PUT for update
-Send a DELETE for delete

===================================================================

-Navigation towards creating a meal: **localhost:3000/api/meal**

-Navigation towards delete, update meal: **localhost:3000/api/meal/1**

-Navigation towards all meals: **localhost:3000/api/meal**

-Navigation towards specific meal: **localhost:3000/api/meal/1**

===================================================================

To create an meal it's necessary to be logged in and use POSTMAN.
-Send a POST to create an meal

To update, delete an meal it's necessary to be logged in and use POSTMAN and be the cook(user).
-Send a PUT for update
-Send a DELETE for delete

To see all the meals it's not necessary to use POSTMAN but you can use it.
-Send a GET for all the meals

To see a specific meal it's not necessary to use POSTMAN but you can use it.
-Send a GET for a specific meal

===================================================================

## Authors and acknowledgment

Daan de Vries - 2205132


## Project status

Project is on hold since 21/05/2023