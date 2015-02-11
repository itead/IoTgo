# IoTgo

## Introdution

IoTgo is an open source IoT platform, like WordPress, ZenCart and all other open source software, you can deploy your own IoTgo cloud service.

We at ITEAD Studio are committed to provide a complete set of hardware for IoTgo with open source hardware designs and open source firmware.

The overall IoTgo system architecture including IoTgo, IoTgo-compatible apps and IoTgo-compatible devices is illustrated by following graph.

![IoTgo System Architecture](docs/iotgo-arch.png)

Single-board microcontroller (like Arduino) developers, single-board computer (like Raspberry PI) developers and other embedded system developers could use IoTgo Device API to connect their devices to IoTgo and then easily control their devices by utilizing IoTgo Web App.

Note: we also provide IoTgo-compatible Device Library which wraps IoTgo Device API. Please refer to [IoTgo Arduino Library](https://github.com/itead/ITEADLIB_Arduino_IoTgo), [IoTgo Segnix Library](https://github.com/itead/Segnix/tree/master/libraries/itead_IoTgo) for details.

Web developers and mobile developers could use IoTgo Web API to build various apps that manage devices connected to IoTgo. To control those devices, IoTgo Device API can be used.

**In one word, we want to provide cloud capability for device developers and device capability for app developers.**

For more detailed information and a working IoTgo cloud service, please head over to [iotgo.iteadstudio.com](http://iotgo.iteadstudio.com/).

## Future Plan

IoTgo is not an ordinary IoT cloud platform, we designed this platform to be open, simple and easy to use, so everyone can handle the hardware, software and website design in the same time. 

However, this platform is still very primitive. For now, it only supports three simple device types. We know what we provide is not enough to satisfy your need. That’s why we set up this Future Plan to improve IoTgo step by step. Let’s see what we will do in the near future.

1. Improve UI design: display device connecting status and last connect time on device detail page. [*Connecting status* added]

2. Support GPS device: receive device GPS information and display the exact location on google map.

3. Add the functions of brightness control and RGB adjustment for Light device.

4. Show power consumption information and the control function for Switch device.

5. Store historic data collected from all kinds of sensers.

6. ~~Provide websocket interface and support bidirectional communication between IoTgo and devices.~~ [Done! *Currently is only enabled for indie device*]

7. ~~Provide Android app code.~~ [Done! Please head over to [IoTgo Android App](https://github.com/itead/IoTgo_Android_App)]

**If you have any advice, please contact us. We sincerely appreciate it.**

## Installation [Automatically *almost*]

If you just want to get a feel of IoTgo, or deploy it for internal use, we recommend [IoTgo docker image](https://registry.hub.docker.com/u/humingchun/iotgo/) which could set up a IoTgo instance by only 4 commands and within 3 minutes (depends on your internet bandwidth).

*Note: `IoTgo docker image` should not be used in production environment, because it lacks several security features, such as Google reCAPTCHA*

### Prerequisite

- [Docker](https://www.docker.com/): An open platform for distributed applications for developers and sysadmins.

### Install IoTgo

```
sudo docker pull dockerfile/mongodb
sudo docker pull humingchun/iotgo
sudo docker run -d --name mongodb dockerfile/mongodb mongod --smallfiles
sudo docker run -d -p 80:80 --name iotgo --link mongodb:mongodb humingchun/iotgo node /opt/IoTgo/bin/www
```

And that's all! You can now access IoTgo at your linux box's ip address and port 80.

If you want to use another port instead of 80, change the `-p` option in the last command from 80 to any other port, such as `-p 3000:80`.

The admin panel is at http://linuxBoxIp:linuxBoxPort/admin, and the default admin account is `iotgo@iteadstudio.com`, corresponding password is `password`. If you want to change the default account and password, you can use `sudo docker exec -i -t iotgo /bin/bash` to login IoTgo docker container and use text editor (vi for example) to change admin information in the `config.js` file.

## Installation [Manually]

Install IoTgo manually takes some effort, but it also means everything is under control.

### Prerequisite

- [Git](http://git-scm.com/): Free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.

- [MongoDB](https://www.mongodb.org/): Open-source document database, the leading NoSQL database

- [Node.js](http://nodejs.org/): An asynchronous JavaScipt event driven framework, and yes, JavaScript on the server!

- [Forever](https://www.npmjs.org/package/forever): Running Node application as system service.

- [Bower](http://bower.io/): A package manager for the web, optimized for the front-end.

### Install IoTgo

Get IoTgo source code from github.com

```
git clone https://github.com/itead/IoTgo.git
```

Change directory to downloaded IoTgo and install dependencies.

```
cd IoTgo && npm install
```

Change directory to IoTgo Web App frontend and install dependencies.

```   
cd public/frontend && bower install
```

Change directory to IoTgo Web App backend and install dependencies.

```
cd ../backend && bower install
```

Change directory back to IoTgo root

```
cd ../..
```

### Configure IoTgo

Copy config.js.sample to config.js which is the actual configuration file being used during IoTgo boot process.

```
cp config.js.sample config.js
```

Edit config.js and change corresponding fields to reflect your hosting environment.

```js
module.exports = {
    host: 'iotgo.iteadstudio.com',          // Hostname of IoTgo
    db: {
        uri: 'mongodb://localhost/iotgo',   // MongoDB database address
        options: {
            user: 'iotgo',                  // MongoDB database username
            pass: 'iotgo'                   // MongoDB database password
        }
    },
    jwt: {
        secret: 'jwt_secret'                // Shared secret to encrypt JSON Web Token
    },
    admin:{
        'iotgo@iteadstudio.com': 'password' // Administrator account of IoTgo
    },
    page: {
        limit: 50,                          // Default query page limit
        sort: -1                            // Default query sort order
    },
    recaptcha: {
		    secret: 'reCAPTCHA secret key',			// https://developers.google.com/recaptcha/intro
        url: 'https://www.google.com/recaptcha/api/siteverify'
    }
};
```

Edit public/frontend/views/signup.html and add your reCAPTCHA site key applied from Google

```html
<div ng-model="response" class="form-group" g-recaptcha
    g-recaptcha-sitekey="Your reCAPTCHA site key goes here"></div>
```

### IoTgo as System Service

To manage IoTgo like system service, such as:

```
sudo service iotgo start  // Start IoTgo
sudo service iotgo stop // Stop IoTgo
```

and make IoTgo start automatically during OS boot, we can create init scripts utilizing [Forever](https://www.npmjs.org/package/forever) to monitor IoTgo.

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

NAME="ITEAD IoTgo"
NODE_BIN_DIR="/usr/bin:/usr/local/bin"
NODE_PATH="/home/itead/IoTgo/node_modules"
APPLICATION_PATH="/home/itead/IoTgo/bin/www"
PIDFILE="/var/run/iotgo.pid"
LOGFILE="/var/log/iotgo.log"
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

## Running IoTgo

To run IoTgo, you can start it in console mode

```
DEBUG="iotgo" ./bin/www
```

To run IoTgo on other port instead of 80, you can use PORT environment variable.

```
PORT="3000" DEBUG="iotgo" ./bin/www
```

To run IoTgo as system service

```
sudo service iotgo start
```

## Web API

IoTgo provides a [RESTful Web API](http://en.wikipedia.org/wiki/Representational_state_transfer) to interact with clients (Web App, Mobile App, Desktop App, etc.).

The general process is as follows:

- Client sends HTTP request to IoTgo.

  - If it is a POST request, then data must be coded in [JSON](http://en.wikipedia.org/wiki/JSON) format and carried in request body.

- IoTgo does some validation against the request.

  - If the validation failed, IoTgo will reply with proper response code and reason.

  - If the validation succeeded, IoTgo will continue processing the request, and reply with 200 OK status code and process result encoded in JSON format.

- Client checks the response from IoTgo.

  - If the status code is not 200 OK, then the request is probably illegal or bad formed.

  - If the status code is 200 OK, but the data (JSON format) has an `error` property, then the request still fails. The value of `error` property is the reason of failure.

  - If the status code is 200 OK, and there is no `error` property in the data, then the request succeeds (finally!). Extract the data and do whatever you want :smiley:

IoTgo is also using [JSON Web Token](https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-31) to protect Web API, so most of these Web API requests must carry `Authorization` header with `JSON Web Token` obtained from `register` or `login` request.

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NDYxNjQ1NGM4ODIzNzFlMWMxOTcyNmYiLCJlbWFpbCI6ImhvbGx5LmhlQGl0ZWFkLmNjIiwiY3JlYXRlZEF0IjoiMjAxNC0xMS0xMVQwMToyMDoyMC4yNjFaIiwiYXBpa2V5IjoiMTU3ODNmZDYtMDc1MS00ODBmLTllMzAtNWZmZTNhNWM4MTM1IiwiaWF0IjoxNDE1NjczNTExfQ.e-gi5N8AIGVeBA5S6vYg9cEaCSGnaFUCscIsYQ2kXoI
```

### User

#### /api/user/register

Register an account on IoTgo. *Authorization not required*

Request method: `POST`

Request body:

```json
{
    "email": "iotgo@iteadstudio.com",
    "password": "password",
    "response": "The user response token provided by the reCAPTCHA to the user."
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

Log in IoTgo using email address and password. *Authorization not required*

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

Create new device by using POST request, get the list of devices owned by user by using GET request. **_Authorization required_**

Request method: `POST`

Request body:

```json
{
    "name": "Switch",
    "group": "ITEAD",
    "type": "01"
}
```

Response body:

```json
{
    "name": "Switch",
    "group": "ITEAD",
    "type": "01", 
    "deviceid": "0100000001", 
    "apikey": "b45c1e61-964a-4ad3-9b9d-0b97ac95fe14",
    "createdAt": "2014-11-24T02:27:41.363Z"
}
```

Request method: `GET`

Response body:

```json
[{
    "name": "Switch",
    "group": "ITEAD",
    "type": "01", 
    "deviceid": "0100000001", 
    "apikey": "b45c1e61-964a-4ad3-9b9d-0b97ac95fe14",
    "createdAt": "2014-11-24T02:27:41.363Z"
}]
```

#### /api/user/device/:deviceid

Get detailed device information by using GET request, update device name and group by using POST request, delete device by using DELETE request. **_Authorization required_**

Request method: `GET`

Response body:

```json
{
    "name": "Switch",
    "group": "ITEAD",
    "type": "01", 
    "deviceid": "0100000001", 
    "apikey": "b45c1e61-964a-4ad3-9b9d-0b97ac95fe14",
    "createdAt": "2014-11-24T02:27:41.363Z",
    "params": {
        "switch": "on"
    },
    "lastModified": "2014-11-27T02:27:41.363Z"
}
```

Request method: `POST`

Request body:

```json
{
    "name": "New Name",
    "group": "New Group"
}
```

Response body:

```json
{
    "name": "New Name",
    "group": "New Group",
    "type": "01", 
    "deviceid": "0100000001", 
    "apikey": "b45c1e61-964a-4ad3-9b9d-0b97ac95fe14",
    "createdAt": "2014-11-24T02:27:41.363Z",
    "params": {
        "switch": "on"
    },
    "lastModified": "2014-11-27T02:27:41.363Z"
}
```

Request method: `DELETE`

Response body:

```json
{
    "name": "New Name",
    "group": "New Group",
    "type": "01", 
    "deviceid": "0100000001", 
    "apikey": "b45c1e61-964a-4ad3-9b9d-0b97ac95fe14",
    "createdAt": "2014-11-24T02:27:41.363Z",
    "params": {
        "switch": "on"
    },
    "lastModified": "2014-11-27T02:27:41.363Z"
}
```

#### /api/user/device/add

Add indie device which is manufactured by ITEAD or ITEAD licensed manufacturers. **_Authorization required_**

Request method: `POST`

Request body:

```json
{
    "name": "Lamp",
    "group": "Indie",
    "deviceid": "0280000001",
    "apikey": "f44eeb0b-8a9e-4454-ad51-89beb93b072e"
}
```

Response body:

```json
{
    "name": "Lamp",
    "group": "Indie",
    "deviceid": "0280000001",
    "apikey": "f44eeb0b-8a9e-4454-ad51-89beb93b072e",
    "createdAt": "2014-11-27T02:49:42.000Z",
    "params": {}
}
```

### Admin

#### /api/admin/login

Log in IoTgo admin area using email address and password. **_Authorization not required_**

Request method: `POST`

Request body:

```json
{
    "email": "admin@iteadstudio.com",
    "password": "password"
}
```

Response body:

```json
{
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAaXRlYWQuY2MiLCJfaWQiOiI1NDY1YTVmMDdmZGRlYjkwNjlhZDJlZDQiLCJjcmVhdGVkQXQiOiIyMDE0LTExLTE0VDA2OjQ5OjIwLjgyMloiLCJhcGlrZXkiOiJiNDVjMWU2MS05NjRhLTRhZDMtOWI5ZC0wYjk3YWM5NWZlMTQiLCJpYXQiOjE0MTU5NDc3NjB9.Rh8BLA7KPs4R74djwKCnHtM1ETYqFXmSIl1IRAbroWI", 
    "user": {
        "email": "admin@iteadstudio.com",
        "isAdmin": true
    }
}
```

#### /api/admin/users

Get the list of registered users on IoTgo. **_Authorization required_**

Request method: `GET`

Response body:

```json
[{
    "email": "humingchun@gmail.com",
    "apikey": "ea62c15b-d194-4b16-a56e-7ad8433c5477",
    "createdAt": "2014-11-27T02:50:10.000Z"
}]
```

#### /api/admin/users/:apikey

Get detailed user information by using GET request, delete user and related devices by using DELETE request. **_Authorization required_**

Request method: `GET`

Response body:

```json
{
    "email": "humingchun@gmail.com",
    "apikey": "ea62c15b-d194-4b16-a56e-7ad8433c5477",
    "createdAt": "2014-11-27T02:50:10.000Z"
}
```

Request method: `DELETE`

Response body:

```json
{
    "email": "humingchun@gmail.com",
    "apikey": "ea62c15b-d194-4b16-a56e-7ad8433c5477",
    "createdAt": "2014-11-27T02:50:10.000Z"
}
```

#### /api/admin/devices

Get the list of created/added devices on IoTgo. **_Authorization required_**

Request method: `GET`

Response body:

```json
[{
    "name": "Switch",
    "group": "ITEAD",
    "type": "01", 
    "deviceid": "0100000001", 
    "apikey": "b45c1e61-964a-4ad3-9b9d-0b97ac95fe14",
    "createdAt": "2014-11-24T02:27:41.363Z"
}]
```

#### /api/admin/devices/:deviceid

Get detailed device information. **_Authorization required_**

Request method: `GET`

Response body:

```json
{
    "name": "Switch",
    "group": "ITEAD",
    "type": "01", 
    "deviceid": "0100000001", 
    "apikey": "b45c1e61-964a-4ad3-9b9d-0b97ac95fe14",
    "createdAt": "2014-11-24T02:27:41.363Z",
    "params": {
        "switch": "on"
    },
    "lastModified": "2014-11-27T02:27:41.363Z"
}
```

#### /api/admin/factorydevices

Get issued licenses (for licensing indie devices) on IoTgo. **_Authorization required_**

Request method: `GET`

Response body:

```json
[{
    "name": "ITEAD",
    "type": "01", 
    "deviceid": "0180000001", 
    "apikey": "94b38bbe-57c8-49bf-a6c4-2871ee5bb873",
    "createdAt": "2014-11-27T02:50:20.000Z"
},
{
    "name": "ITEAD",
    "type": "01", 
    "deviceid": "0180000002", 
    "apikey": "938a8f4f-9f0f-424b-b5ac-f58b8f7a539c",
    "createdAt": "2014-11-27T02:50:20.000Z"
}]
```

#### /api/admin/factorydevices/create

Generate new licenses for indie devices. **_Authorization required_**

Request method: `POST`

Request body:

```json
{
    "name": "ITEAD",
    "type": "02",
    "qty": 2
}
```

Response body:

```json
[{
    "name": "ITEAD",
    "type": "02", 
    "deviceid": "0280000001", 
    "apikey": "37e45852-a381-4243-8bfe-cc3c4c2becab",
    "createdAt": "2014-11-27T03:00:00.000Z"
},
{
    "name": "ITEAD",
    "type": "02", 
    "deviceid": "0280000002", 
    "apikey": "41556a98-7685-424f-bc27-74bf712108b2",
    "createdAt": "2014-11-27T03:00:00.000Z"
}]
```

## Device API

IoTgo provides Device API to interact with devices. Device API is also intended be used by clients (Web App, Mobile App, Desktop App, etc.) to control connected devices.

Device API is JSON-based, which means all request and response data is enclosed in JSON format. IoTgo currently supports 3 kind of request.

- **Register**: Get `apikey` of current user who owns the device, only applies to indie device.
- **Update**: Update device status to IoTgo
- **Query**: Get device status from IoTgo

### Wire Protocol

#### Register

Request:

```json
{
    "action": "register",
    "deviceid": "01ad0253f2",
    "apikey": "123e4567-e89b-12d3-a456-426655440000"
}
```

*Note: `register` request is only for indie devices, not DIY devices. So `deviceid` and `apikey` above are generated by IoTgo for licensed manufacturers.*

Response:

```json
{
    "error": 0,
    "deviceid": "01ad0253f2",
    "apikey": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

`error: 0` denotes a successful response. If the `error` property is not `0`, then error occurs, and `reason` property will exist for detailed error information. This is also true for `Update` and `Query` request.

*Note: `apikey` in a successful response is the user currently owns the indie device.*

#### Update

Request:

```json
{
    "action": "update",
    "deviceid": "01ad0253f2",
    "apikey": "123e4567-e89b-12d3-a456-426655440000",
    "params": {
        "switch": "on"
    }
}
```

*Note: `params` property is a JSON object which contains all status information of the device.*

Response:

```json
{
    "error": 0,
    "deviceid": "01ad0253f2",
    "apikey": "123e4567-e89b-12d3-a456-426655440000"
}
```

*Note: `deviceid` and `apikey` have the same values as they do in the request.*

#### Query

Request:

```json
{
    "action": "query",
    "deviceid": "01ad0253f2",
    "apikey": "123e4567-e89b-12d3-a456-426655440000",
    "params": [
        "switch"
    ]
}
```

*Note: `params` property is an array containing status names to be queried. Empty array denotes querying all status.*

Response:

```json
{
    "error": 0,
    "deviceid": "01ad0253f2",
    "apikey": "123e4567-e89b-12d3-a456-426655440000",
    "params": {
        "switch": "on"
    }
}
```

*Note: `deviceid` and `apikey` have the same values as they do in the request.*


### Transfer Protocol

Device API request and response can be carried by any reliable transfer protocol, and IoTgo supports both HTTP and WebSocket.

**_We strongly recommend WebSocket over HTTP because WebSocket enables IoTgo to push device status update to both the actual device and device owner's clients_**

#### HTTP 1.0

Device API access point is http://iotgo.iteadstudio.com/api/http.

Request header:

```
POST /api/http HTTP/1.0
Host: iotgo.iteadstudio.com
Content-Type: application/json
Content-Length: 116
```

*Note: Host header must be present even if HTTP 1.0 itself does not require it.*

#### HTTP 1.1

Device API access point is http://iotgo.iteadstudio.com/api/http.

Request header:

```
POST /api/http HTTP/1.1
Host: iotgo.iteadstudio.com
Content-Type: application/json
Content-Length: 116
```

#### WebSocket

Device API access point is ws://iotgo.iteadstudio.com/api/ws.

## Supported Browsers

IoTgo Web App currently supports the current and prior major release of Chrome, Firefox, Internet Explorer and Safari on a rolling basis, which means IE6/IE7/IE8/IE9 will not work properly.

## Support

## License

[MIT](https://github.com/itead/IoTgo/blob/master/LICENSE)
