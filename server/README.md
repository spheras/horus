# HORUS Server
Horus Server is a nodeJS application to provide RESTful services for the Desktop and Mobile apps.
The server will need to connect to a POSTGRES database with the POSTGIS extension.

## CONFIGURATION
You need to provide some basic configuration to the server in the way of enviroment variables.  The application also support the ".env" file for testing purposes mainly.
The following is an example of the [`.env`](https://github.com/motdotla/dotenv) file setting values to the needed variables.

```
DATABASE_HOST=localhost
DATABASE_USER=horus
DATABASE_PASSWORD=horus
DATABASE_NAME=horus
DATABASE_SCHEMA=horus
SECURITY_SECRET=mysecret
HTTPS_PORT=8443
HTTP_PORT=8080
SERVER_PUBLIC_DNS=192.168.100.9
SERVER_PUBLIC_PORT=8080
```

##  POSTGRES DATABASE
You'll need to provide the postgres database (with POSTGIS extension enabled) connection parameters. 

As an example, you could use a docker container for testing purposes.
This example will download the docker container and configure some basic parameters.

```
docker run --name some-postgis -e POSTGRES_PASSWORD=mysecretpassword -d mdillon/postgis
docker run -it --link some-postgis:postgres --rm postgres     sh -c 'exec psql -h "$POSTGRES_PORT_5432_TCP_ADDR" -p "$POSTGRES_PORT_5432_TCP_PORT" -U postgres'
```

Execute this whenever you want to run the docker container.

```
docker run -d -p 5432:5432 mdillon/postgis
```

Once you have a POSTGRES database you will need to provide a database and schema.
The following SQL will create a database for you.

```
DROP DATABASE IF EXISTS horus;
CREATE DATABASE horus;
CREATE USER horus WITH ENCRYPTED PASSWORD 'horus';
GRANT ALL PRIVILEGES ON DATABASE horus TO horus;
```

Don't forget to enable the postgis extension for the schema:

```
CREATE EXTENSION postgis;
```

## Launch Server

In order to launch the server you will need to run:

```
npm run dev
```

