# DemoAPI

DemoAPI is a node.js api built with express framework and a NoSQL databse (MongoDB)

## Installation

Clone the repository, I’m using HTTPS but feel free to use any other method
```terminal
git clone https://github.com/isiomaC/DemoAPI.git 
```

Install node modules
```terminal
npm i
```

Navigate to mongodb website and create a free account. Spin Up an instance with the free tier and get your connection String. 

Create a .env file at the root directory of the project, add the following keys :

```terminal
MONGOURI={database_connection_string}

JWTSECRET={Any random String}

CRYPTO_SECRET={Any random String}
```

## Usage

```terminal

# starts node.js server on port 5000
npm run server

using post man or any web client you can consume the api endpoints at http://localhost:5000/api/v1

```
