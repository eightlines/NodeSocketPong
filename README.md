#NodeSocketPong

Classic Pong using mobile devices as controllers. (NodeJS, HTML5, Socket.IO, ProcessingJS). The application will host a game board on larger desktop screens, and convert mobile devices to controllers. The game also features a queueing mechanism to place 2+ players in line for the next game. 

##Requirements
- NodeJS 0.8+ (http://nodejs.org/)
- Socket.IO 0.9 (http://socket.io/)
- Express 3.0 (http://expressjs.com/)
- ProcessingJS 1.3.6 (http://processingjs.org/)

##Installation
- git clone https://github.com/eightlines/NodeSocketPong.git
- cd NodeSocketPong
- npm install

##Notes
- ProcessingJS is used on the desktop and is hosted off of ProcessingJS.org webservers. Recommend using a local version of the JS. 

##Running
- node server.js
- Using the IP and Port in the console, launch a web browser on the desktop. Launch two additional mobile web browsers to the same IP to become controllers.
