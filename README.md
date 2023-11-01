# 🏷️ FP capstone (BE)

[![codecov](https://codecov.io/gh/nicholas5538/fp-voucher-BE/graph/badge.svg?token=7QBFKXF928)](https://codecov.io/gh/nicholas5538/fp-voucher-BE)

## Table Of Contents

- [Quick Links](#quick-links)
- [Context](#context)
- [Getting Started](#getting-started)
  - [Environment Setup](#environment-setup)
  - [Repository Setup](#repository-setup)
- [Developing](#developing)
- [API Documentation](#api-documentation)
  - [GET request](#get-request)
  - [POST request](#post-request)
  - [PATCH request](#patch-request)
  - [DELETE request](#delete-request)
- [Additional Documentations](#additional-documentations)

## Quick links

- [Frontend repository](https://github.com/nicholas5538/fp-voucher-FE "fp-voucher-FE")
- [Backend repository](https://github.com/nicholas5538/fp-voucher-BE "fp-voucher-BE")

## Context

The purpose of this project is to practice some backend concepts as well as to learn the best practices for a REST API architecture.

This is a Node.js app that contains multiple API endpoints to retrieve or manipulate data on a [MongoDB](https://www.mongodb.com/ "MongoDB official site") database.

The following HTTP request methods have been implemented:

1. _**GET**_
2. _**POST**_
3. _**PATCH**_
4. _**DELETE**_

### Tech stack

<img align="left" alt="TypeScript" width="40px" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" style="padding-right:10px;" />
<img align="left" alt="Docker" width="40px" src="https://cdn.jsdelivr.net/npm/devicon-2.2@2.2.0/icons/docker/docker-original.svg" style="padding-right:10px;" />
<img align="left" alt="Node.js" width="40px" src="https://cdn.jsdelivr.net/npm/devicon-2.2@2.2.0/icons/nodejs/nodejs-original.svg" style="padding-right:10px;" />
<img align="left" alt="Express.js" width="40px" src="https://cdn.jsdelivr.net/npm/devicon-2.2@2.2.0/icons/express/express-original.svg" style="padding-right:10px;" />
<img alt="Webpack" width="30px" src="https://cdn.jsdelivr.net/npm/devicon-2.2@2.2.0/icons/webpack/webpack-original.svg" />

## Getting Started

### Environment Setup

#### 2 ways to run the apps

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. With package manager **[pnpm](https://pnpm.io/installation)**

   - Install any version of node that is >= 14.0.0.

   > 💁 **Tip:** You can use [nvm](https://github.com/nvm-sh/nvm "nvm repo") to easily manage multiple versions of node. Once installed, run `nvm use` in the project directory.

   - Install [pnpm](https://pnpm.io/installation)

   > 💁 `npm install -g pnpm`

### Repository Setup

Once you have your environment setup, you can clone the repository.

```zsh
git clone https://github.com/nicholas5538/fp-voucher-BE.git
cd fp-voucher-BE
```

2 methods of obtaining environment variables

1. Using [dotenv-vault](https://github.com/dotenv-org/dotenv-vault#pull "dotenv-vault GitHub repository"), please request `vault_id` from [@nicholas5538](https://github.com/nicholas5538)

```zsh
npx dotenv-vault@latest new <vault_id>
npx dotenv-vault@latest pull development .env
```

2. Create a `.env` file to store environment variables, please request secret keys from [@nicholas5538](https://github.com/nicholas5538 "nicholas5538 GitHub profile").

```zsh
JWT_SECRET=<Insert a 64-bit JWT secret key here>
JWT_EXPIRES_IN=<Insert JWT expiry date here>
MONGO_COLLECTION=<Insert collection name here>
MONGO_URI=<Insert connection string here>
PORT=<Insert port number here>
```

## Developing

Once you have [set up the repo](#repository-setup), you're ready to start developing. Starting the development environment is managed by the following command(s).

- With **Docker (recommended)**

```sh
# With Docker compose, you're able
# to see live changes after refreshing
docker compose up --env-file .env -d --build

# Or build your own image
docker build --compress -t <image name> --target dev .
# For Windows PowerShell: ${pwd}, : $(pwd)
docker run -d -p 3000:3000 -v .:/app -v /app/node_modules --name <container name> <image name>
```

- With **pnpm**

```sh
pnpm run i # Only run this when you have not installed any dependencies
pnpm run dev
```

The `dev` command will start the application in your local environment (port 5173).

## API Documentation

### GET request

<details>
    <summary>1. https://fp-capstone-backend.onrender/api/v1/vouchers</summary>

Obtain all vouchers with pagination options

- Queries (Optional)

  | Query  | Type   | Description                            |
  | ------ | ------ | -------------------------------------- |
  | offset | Number | Define the starting index of your data |
  | limit  | Number | Define the amount of data per request  |

- Making a request

  ```curl
  curl \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -H 'Authorization: Bearer 123456 \
    -X GET \
    https://fp-capstone-backend.onrender/api/v1/vouchers?offset=0&limit=1
  ```

- Response (200)

  ```json
  {
    "_links": {
      "base": "https://fp-capstone-backend.onrender",
      "self": "https://fp-capstone-backend.onrender.com/api/v1/vouchers?offset=0&limit=1",
      "next": "https://fp-capstone-backend.onrender.com/api/v1/vouchers?offset=1&limit=1"
    },
    "end": 1,
    "lastPage": 10,
    "limit": 1,
    "page": 1,
    "result": [
      {
        "_id": "1234",
        "category": "Pick-up",
        "description": "10% off for new user",
        "discount": 10,
        "expiryDate": "2023-09-22T00:00:00.000Z",
        "minSpending": 1.5,
        "promoCode": "PUNEW",
        "startDate": "2023-08-27T00:00:00.000Z"
      }
    ],
    "start": 0,
    "totalVouchers": 10,
    "X-Total-count": 1
  }
  ```

  </details>

<details>
    <summary>2. https://fp-capstone-backend.onrender/api/v1/vouchers/{voucherId}</summary>

Obtain a single voucher based on the voucher id defined on the URL

- Parameter

  | Parameter | Description                               |
  | --------- | ----------------------------------------- |
  | voucherId | Retrieves the specified id of the voucher |

- Making a request

  ```curl
  curl \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -H 'Authorization: Bearer 123456 \
    -X GET \
    https://fp-capstone-backend.onrender/api/v1/vouchers/1234
  ```

- Response (HTTP 200)

  ```json
  {
    "_links": {
      "base": "http://fp-capstone-backend.onrender.com",
      "self": "http://fp-capstone-backend.onrender.com/api/v1/vouchers/1234"
    },
    "results": {
      "_id": "1234",
      "category": "Pick-up",
      "description": "10% off for new user",
      "discount": 10,
      "expiryDate": "2023-09-22T00:00:00.000Z",
      "minSpending": 1.5,
      "promoCode": "PUNEW",
      "startDate": "2023-08-27T00:00:00.000Z"
    },
    "X-Total-count": 1
  }
  ```

  </details>

### POST request

<details>
    <summary>1. https://fp-capstone-backend.onrender/users</summary>

You will obtain a JWT that allows you to access all the other API endpoints

- Request body (required)

  | Key   | Description                           |
  | ----- | ------------------------------------- |
  | email | Email must have a valid @gmail domain |
  | name  | Name defined in your gmail account    |

- Making a request

  ```curl
  curl \
    -H 'Content-Type: application/json' \
    -H 'Accept: */*' \
    -X POST \
    https://fp-capstone-backend.onrender/users
  ```

- Response (HTTP 201)

  ```json
  {
    "token": "ey=248u3987534-s"
  }
  ```

  </details>

<details>
    <summary>2. https://fp-capstone-backend.onrender/api/v1/vouchers</summary>

Creates a voucher and store it in the database

- Request body (required)

| Key         | Value                                                    | Type                |
| ----------- | -------------------------------------------------------- | ------------------- |
| category    | "Pick-up", "Delivery", "Dine-in", "Pandamart", "Pandago" | String              |
| description | "10% off on Subway                                       | String              |
| discount    | 10                                                       | Number              |
| minSpending | 0                                                        | Number              |
| promoCode   | SUBWAY10                                                 | String              |
| expiryDate  | 2023-10-20                                               | String (YYYY-MM-DD) |
| startDate   | 2023-08-10                                               | String (YYYY-MM-DD) |

- Making a request

  ```curl
  curl \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -H 'Authorization: Bearer 123456 \
    -d '{"category: "Delivery", "description: "10% off on Subway", "discount": 10, "minSpending": 0, "promoCode": "SUBWAY10", expiryDate: "2023-10-20", startDate: "2023-08-10"}'
    -X POST \
    https://fp-capstone-backend.onrender/api/v1/vouchers
  ```

- Response (HTTP 201)
  ```json
  { "msg": "Voucher has been created" }
  ```
  </details>

### PATCH request

<details>
    <summary>https://fp-capstone-backend.onrender/api/v1/vouchers/{voucherId}</summary>

Updates the voucher without modifying the entire data if it's not necessary

- Parameter

  | Parameter | Description                              |
  | --------- | ---------------------------------------- |
  | voucherId | Updates the voucher that has the same ID |

- Request body (required)

  All keys except for `expiryDate` and `startDate` are optional

  | Key         | Type                                  |
  | ----------- | ------------------------------------- |
  | category    | String                                |
  | description | String                                |
  | discount    | Number                                |
  | minSpending | Number                                |
  | promoCode   | String                                |
  | expiryDate  | String (YYYY-MM-DD), must be included |
  | startDate   | String (YYYY-MM-DD), must be included |

- Making a request

  ```curl
  curl \
    -H 'Content-Type: application/json' \
    -H 'Accept: */*' \
    -H 'Authorization: Bearer 123456 \
    -d '{"category": "Pandamart", "expiryDate": "2023-10-20", "startDate": "2023-08-10"}'
    -X PATCH \
    https://fp-capstone-backend.onrender/api/v1/vouchers/1234
  ```

- Response (HTTP 204)

  ```http request
  204 No Content
  ```

  </details>

### DELETE request

<details>
    <summary>https://fp-capstone-backend.onrender/api/v1/vouchers/{voucherId}</summary>

Deletes the voucher from the database

- Parameter

  | Parameter | Description                           |
  | --------- | ------------------------------------- |
  | voucherId | Delete a voucher that has the same ID |

- Making a request

  ```curl
  curl \
    -H 'Content-Type: application/json' \
    -H 'Accept: */*' \
    -H 'Authorization: Bearer 123456 \
    -X DELETE \
    https://fp-capstone-backend.onrender/api/v1/vouchers/1234
  ```

- Response (HTTP 204)

  ```http request
  204 No Content
  ```

  </details>

## Additional Documentations

- [Docker documentation](https://docs.docker.com/ "Docker documentation")
- [Express.js](https://expressjs.com/ "Express.js documentation")
- [Mongoose](https://mongoosejs.com/docs/guide.html "Mongoose documentation")
- [Webpack](https://webpack.js.org/concepts/ "Webpack documentation")
