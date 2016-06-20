# Dockapp Dashboard

A web dashboard to monitor and control Dockapp. It includes a stand-alone web server that hosts a web 
service and a front end based on [React](https://facebook.github.io/react/). 

## Installation

0. Install [nginx](https://nginx.org/), if not already present in the system

0. Install the server's dependencies

        npm install server

0. Install the web front end's dependencies

        npm install

0. Configure nginx to serve the static files and proxy the web service
 
    For example, within the `http` section of `nginx.conf` configure the default `server` with a 
    configuration like this one:
 
        server {
               listen       8080;
               server_name  localhost;
        
               location / {
                   root   /usr/local/dockapp_dashboard/public;
                   index index.html index.htm;
               }
        
               location /api/ {
                       proxy_pass http://127.0.0.1:3000/;
                       proxy_redirect default;
                       proxy_http_version 1.1;
                       proxy_set_header Upgrade $http_upgrade;
                       proxy_set_header Connection 'upgrade';
                       proxy_set_header Host $host;
                       proxy_cache_bypass $http_upgrade;
               }
        
               error_page   500 502 503 504  /50x.html;
               location = /50x.html {
                   root   html;
               }
        }

    * Be sure to change the `root` to the location of the `public` directory of the dockapp dashboard. 
    * `proxy_pass` should correspond to the port the web service is running in (configured in the
      following step)
      
0. Start the web service by running

        node server/app/main.js

## Configuration

The back end configuration file is `server/config.json`. It supports the following options:

- `port`: (default '3000') Port number the back-end server will run in
- `dockapp_path`: Path to the **dockapp** installation
- `test`: (default: false) Set to `true` to run in test mode, which simulates dockapp.
- `max_log_length`: (default: 100) Max number of log entries to send through the web service
- `log_directory`: (default: './log') Directory where logs will be saved.
- `log_level`: (default: 'info') Log level. Set to one of `error`, `warn`, `info`, `verbose`, `debug` or `silly`.`

## System description

The system consists of a **web front-end** and a back-end **web service**.

The front end is served as a series of static files by **nginx**. The client-side scripts connect to the
back-end web service through AJAX calls and update the UI using React.

The back-end service is a stand-alone web server implemented in node.js and proxied by nginx. It has a simple
JSON api.

## Directory reference

- **src**: Front end sources (JSX / ECMAScript 2015)
- **public**: Static web files for the front end, including CSS stylesheets, client-side javascript,
  images and third party libraries
- **sass**: SASS stylesheets, compiled through `gulp sass`
- **server**: Back end server files
    - **app**: Compiled javascript files. These are generated by babel and shouldn't be edited directly.
    - **log**: Back end log files
    - **scripts**: Auxiliary bash scripts to interact with dockapp
    - **src**: Back end sources (ECMAScript 2015)
    - **tests**: Test files and sources
    - **config.json**: Back end configuration file

## Building

### Back end server

The back end files are compiled from ECMAScript 2015 to regular JS using Babel.

0. Install the dev dependencies

        npm install --dev server

0. Compile

        gulp --gulpfile server/gulpfile.js compile

### Front end

The front end files are compiled from JSX / ECMAScript 2015 to regular JS using Babel. Dependencies (like React)
are also compiled and packed to a vendors.js file. 

0. Install the dev dependencies

        npm install --dev server

0. Compile JS sources

        gulp scripts:dev

0. Compile SASS stylesheets

        gulp sass

## Deployment with Docker

The [Dockerfile](Dockerfile) can be used to build a self-contained Docker image for the dashboard. Install [Docker](https://www.docker.com/), then build the image from the top level directory:
```
docker build -t dockapp_frontend .
```
Spin up a Docker container with
```
docker run -p 8080:8080 dockapp_frontend
```
This exposes the container's port 8080 to the host's port 8080.

## Credits

Eric Londaits for [IMAGINARY](https://www.imaginary.org)

## License

TODO: Write license
