# IoTgo Platform

## Introdution

IoTgo Platform is an open source IoT platform, like WordPress, ZenCart and all other open source software, you can deploy your own IoTgo cloud platform.

We at ITEAD Studio are committed to provide a complete set of hardware for IoTgo Platform with open source hardware designs and open source firmware.

The overall IoTgo system architecture including platform and devices is illustrated by following graph.

![IoTgo System Architecture](docs/iotgo-arch.png)

Single-board microcontroller (like Arduino) developers, single-board computer (like Raspberry PI) developers and other embedded system developers could use IoTgo Platform Device API to connect their devices to IoTgo Platform and then easily control their devices by utilizing IoTgo Platform Web App.

Note: we also provide IoTgo Device SDK which wraps IoTgo Platform Device API. Please refer to [https://github.com/itead/IoTgo](https://github.com/itead/IoTgo) for details.

Web developers and mobile developers could use IoTgo Platform Web API to build various apps that manage devices connected to IoTgo Platform. To control those devices, IoTgo Platform Device API can be used.

**In one word, we want to provide cloud capability for device developers and device capability for app developers.**

For more detailed information and a working IoTgo Platform, please head over to [iotgo.iteadstudio.com](http://iotgo.iteadstudio.com/).

## Installation

### Prerequisite

- [Git](http://git-scm.com/): Free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.

- [MongoDB](https://www.mongodb.org/): Open-source document database, the leading NoSQL database

- [Node.js](http://nodejs.org/): An asynchronous JavaScipt event driven framework, and yes, JavaScript on the server!

- [Forever](https://www.npmjs.org/package/forever): Running Node application as system service.

- [Bower](http://bower.io/): A package manager for the web, optimized for the front-end.

### Install IoTgo Platform

Get IoTgo Platform source code from github.com

```
git clone https://github.com/itead/IoTgo-Platform.git
```

Change directory to downloaded IoTgo-Platform and install dependencies.

```
cd IoTgo-Platform && npm install
```

Change directory to IoTgo-Platform Web App frontend and install dependencies.

```   
cd public/frontend && bower install
```

Change directory to IoTgo-Platform Web App backend and install dependencies.

```
cd ../backend && bower install
```

Change directory back to IoTgo-Platform root

```
cd ../..
```

### Configure IoTgo Platform

Copy config.js.sample to config.js which is the actual configuration file being used during IoTgo Platform boot process.

```
copy config.js.sample config.js
```

Edit config.js and change corresponding fields to reflect your hosting environment.

```js
module.exports = {
  host: 'iotgo.iteadstudio.com',        // Hostname of IoTgo platform
  db: {
    uri: 'mongodb://localhost/iotgo',   // MongoDB database address
    options: {
      user: 'iotgo',                    // MongoDB database username
      pass: 'iotgo'                     // MongoDB database password
    }
  },
  jwt: {
    secret: 'jwt_secret'                // Shared secret to encrypt JSON Web Token
  },
  admin:{
    'iotgo@iteadstudio.com': 'password' // Administrator account of IoTgo platform
  },
  page: {
    limit: 50,                          // Default query page limit
    sort: -1                            // Default query sort order
  }
};
```

### IoTgo Platform as System Service

To manage IoTgo Platform like system service, such as:

```
sudo service iotgo start  // Start IoTgo Platform
sudo service iotgo stop // Stop IoTgo Platform
```

and make IoTgo Platform start automatically during OS boot, we can create init scripts utilizing [Forever](https://www.npmjs.org/package/forever) to monitor IoTgo Platform.

The following init script is a working example. If you want to use it, please put the script in `/etc/init.d/` folder and change file permission to 755. You may also need to change `NAME`, `NODE_PATH`, `NODE_APPLICATION_PATH` to reflect your hosting environment.

```
sudo touch /etc/init.d/iotgo
sudo chmod 755 /etc/init.d/iotgo
sudo update-rc.d iotgo defaults
```

*Note: please refer to [Node.js and Forever as a Service: Simple Upstart and Init Scripts for Ubuntu](https://www.exratione.com/2013/02/nodejs-and-forever-as-a-service-simple-upstart-and-init-scripts-for-ubuntu/) for detailed explanations of the script.*


```bash
#!/bin/bash
#
# An init.d script for running a Node.js process as a service using Forever as
# the process monitor. For more configuration options associated with Forever,
# see: https://github.com/nodejitsu/forever
#
# This was written for Debian distributions such as Ubuntu, but should still
# work on RedHat, Fedora, or other RPM-based distributions, since none of the
# built-in service functions are used. So information is provided for both.
#

NAME="ITEAD IoTgo Platform"
NODE_BIN_DIR="/usr/bin:/usr/local/bin"
NODE_PATH="/home/itead/IoTgo-Platform/node_modules"
APPLICATION_PATH="/home/itead/IoTgo-Platform/bin/www"
PIDFILE="/var/run/iotgo-platform.pid"
LOGFILE="/var/log/iotgo-platform.log"
MIN_UPTIME="5000"
SPIN_SLEEP_TIME="2000"
 
PATH=$NODE_BIN_DIR:$PATH
export NODE_PATH=$NODE_PATH
 
start() {
    echo "Starting $NAME"
    forever \
      --pidFile $PIDFILE \
      -a \
      -l $LOGFILE \
      --minUptime $MIN_UPTIME \
      --spinSleepTime $SPIN_SLEEP_TIME \
      start $APPLICATION_PATH 2>&1 > /dev/null &
    RETVAL=$?
}
 
stop() {
    if [ -f $PIDFILE ]; then
        echo "Shutting down $NAME"
        forever stop $APPLICATION_PATH 2>&1 > /dev/null
        rm -f $PIDFILE
        RETVAL=$?
    else
        echo "$NAME is not running."
        RETVAL=0
    fi
}
 
restart() {
    stop
    start
}
 
status() {
    echo `forever list` | grep -q "$APPLICATION_PATH"
    if [ "$?" -eq "0" ]; then
        echo "$NAME is running."
        RETVAL=0
    else
        echo "$NAME is not running."
        RETVAL=3
    fi
}
 
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    *)
        echo "Usage: {start|stop|status|restart}"
        exit 1
        ;;
esac
exit $RETVAL
```

## Running IoTgo Platform

To run IoTgo Platform, you can start it in console mode

```
DEBUG="iotgo" ./bin/www
```

To run IoTgo Platform on other port instead of 80, you can use PORT environment variable.

```
PORT="3000" DEBUG="iotgo" ./bin/www
```

To run IoTgo Platform as system service

```
sudo service iotgo start
```

## Web API

IoTgo Platform provides a [RESTful Web API](http://en.wikipedia.org/wiki/Representational_state_transfer) to interact with clients (Web App, Mobile App, Desktop App, etc.).

The general process is as follows:

- Client sends HTTP request to IoTgo Platform.

  - If it is a POST request, then data must be coded in [JSON](http://en.wikipedia.org/wiki/JSON) format and carried in request body.

- IoTgo Platform does some validation against the request.

  - If the validation failed, IoTgo Platform will reply with proper response code and reason.

  - If the validation succeeded, IoTgo Platform will continue processing the request, and reply with 200 OK status code and process result encoded in JSON format.

- Client checks the response from IoTgo Platform.

  - If the status code is not 200 OK, then the request is probably illegal or bad formed.

  - If the status code is 200 OK, but the data (JSON format) has an `error` property, then the request still fails. The value of `error` property is the reason of failure.

  - If the status code is 200 OK, and there is no `error` property in the data, then the request succeeds (finally!). Extract the data and do whatever you want :smiley:

IoTgo Platform is also using [JSON Web Token](https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-31) to protect Web API, so most of these Web API requests must carry `Authorization` header with `JSON Web Token` obtained from `register` or `login` request.

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NDYxNjQ1NGM4ODIzNzFlMWMxOTcyNmYiLCJlbWFpbCI6ImhvbGx5LmhlQGl0ZWFkLmNjIiwiY3JlYXRlZEF0IjoiMjAxNC0xMS0xMVQwMToyMDoyMC4yNjFaIiwiYXBpa2V5IjoiMTU3ODNmZDYtMDc1MS00ODBmLTllMzAtNWZmZTNhNWM4MTM1IiwiaWF0IjoxNDE1NjczNTExfQ.e-gi5N8AIGVeBA5S6vYg9cEaCSGnaFUCscIsYQ2kXoI
```

### User

#### /api/user/register

Register an account on IoTgo Platform. *Authorization not required*

Request method: `POST`

Request body:

```json
{
  "email": "iotgo@iteadstudio.com",
  "password": "password"
}
```

Response body:

```json
{
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAaXRlYWQuY2MiLCJfaWQiOiI1NDY1YTVmMDdmZGRlYjkwNjlhZDJlZDQiLCJjcmVhdGVkQXQiOiIyMDE0LTExLTE0VDA2OjQ5OjIwLjgyMloiLCJhcGlrZXkiOiJiNDVjMWU2MS05NjRhLTRhZDMtOWI5ZC0wYjk3YWM5NWZlMTQiLCJpYXQiOjE0MTU5NDc3NjB9.Rh8BLA7KPs4R74djwKCnHtM1ETYqFXmSIl1IRAbroWI", 
    "user": {
        "email": "iotgo@iteadstudio.com", 
        "createdAt": "2014-11-24T06:49:20.822Z", 
        "apikey": "b45c1e61-964a-4ad3-9b9d-0b97ac95fe14", 
    }
}
```

#### /api/user/login

Log in IoTgo Platform using email address and password. *Authorization not required*

Request method: `POST`

Request body:

```json
{
  "email": "iotgo@iteadstudio.com",
  "password": "password"
}
```

Response body:

```json
{
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAaXRlYWQuY2MiLCJfaWQiOiI1NDY1YTVmMDdmZGRlYjkwNjlhZDJlZDQiLCJjcmVhdGVkQXQiOiIyMDE0LTExLTE0VDA2OjQ5OjIwLjgyMloiLCJhcGlrZXkiOiJiNDVjMWU2MS05NjRhLTRhZDMtOWI5ZC0wYjk3YWM5NWZlMTQiLCJpYXQiOjE0MTU5NDc3NjB9.Rh8BLA7KPs4R74djwKCnHtM1ETYqFXmSIl1IRAbroWI", 
    "user": {
        "email": "iotgo@iteadstudio.com", 
        "createdAt": "2014-11-24T06:49:20.822Z", 
        "apikey": "b45c1e61-964a-4ad3-9b9d-0b97ac95fe14", 
    }
}
```

#### /api/user/password

Change password for the user identified by JSON Web Token. *Authorization required*

Request method: `POST`

Request body:

```json
{
  "oldPassword": "old password",
  "newPassword": "new password"
}
```

Response body:

```json
{}
```

### Device

#### /api/user/device

#### /api/user/device/:deviceid

#### /api/user/device/add

### Admin

#### /api/admin/login

#### /api/admin/users

#### /api/admin/users/:apikey

#### /api/admin/devices

#### /api/admin/devices/:deviceid

#### /api/admin/factorydevices

#### /api/admin/factorydevices/create

## Device API

## Support

## License

[MIT](https://github.com/itead/IoTgo-Platform/blob/master/LICENSE)
