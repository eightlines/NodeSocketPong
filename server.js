var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.set('heartbeat interval', 5);
io.set('heartbeat timeout', 15);

var port = process.env['app_port'] || 20483;

var mobileClients = {};
var desktopClients = {};
var playerPositions = [0, 0];
var queue = [];	

server.listen(port);
require('dns').lookup(require('os').hostname(), function (err, addr, fam) {
  console.log('Server created at http://' + addr + ':' + port); // Node 0.8
})

app.get('/', function(req, res) {	
	res.sendfile(__dirname + (isMobile(req) ? '/html/mobile.html' : '/html/desktop.html'));
});

app.get('/font.ttf', function(req, res) {	
	res.sendfile(__dirname + '/media/fonts/MyriadWebPro.ttf');
});

app.get('/reset', function(req, res) {
	queue = [];
	res.send("Queue Reset");
});

console.log('Queue Init', queue);

// Socket IO
io.sockets.on('connection', function (socket) 
{
	console.log('Connection ID:', socket.id);
	
	socket.on('connect', function (data) 
	{
		switch (data.connectionType)
		{
			case 'Mobile':
				queue.push(socket.id);
				
				mobileClients[socket.id] = socket; //Save Socket by ID for client specific messages

				var itemIndex = findInArray(queue, socket.id);
				mobileClients[socket.id].emit('message', {queue:itemIndex + 1, game:'stop'}); // +1 for display purposes

				updateQueue(); // Update Queue Placements
			break;
			
			case 'Desktop':
				desktopClients[socket.id] = socket; //Save Socket by ID for client specific messages
			break;
		}
	});

	socket.on('disconnect', function () 
	{
		var itemIndex = findInArray(queue, socket.id);
		if (itemIndex != -1)
			queue.splice(itemIndex, 1); //Remove ID from queue

		delete desktopClients[socket.id]; //Remove ID from clients
		delete mobileClients[socket.id]; //Remove ID from clients
		
		updateQueue(); //Update Queue Placements
	});

	socket.on('gameEnd', function () 
	{
		var id;
		for (var i = 0; i < 2; i++) // 2 Player Game
		{
			if (mobileClients[queue[i]] != undefined)
				mobileClients[queue[i]].emit('message', {game:'end'});

			id = queue[0];
			queue.shift(); // Remove ID from front
			queue.push(id); // Move ID to end of queue
		}
		
		updateQueue(); // Update Queue Placements
	});

	socket.on('movement', function (data) 
	{
		if (queue[0] == socket.id)
			playerPositions[0] = data.positionY;
		else if (queue[1] == socket.id)
			playerPositions[1] = data.positionY;
			
		for (i in desktopClients) // Broadcast messages to Desktop Clients only
		{
			desktopClients[i].emit("player", {player:'1', positionY:playerPositions[0]});
			desktopClients[i].emit("player", {player:'2', positionY:playerPositions[1]});
		}
	});
});

var updateQueue = function ()
{
	console.log('Update Queue: ', queue);

	if (queue.length >= 2)
	{
		for (var i = 0; i < 2; i++) // 2 Player Game
		{
			if (mobileClients[queue[i]] != undefined)
				mobileClients[queue[i]].emit('message', {queue:i + 1,game:'start'});
			
			for (d in desktopClients) // Broadcast messages to Desktop Clients only
				desktopClients[d].emit('game', {activate:true});
		}
	}
	else
	{
		for (i in mobileClients)
		{
			var itemIndex = findInArray(queue, i);
			mobileClients[i].emit('message', {queue:itemIndex + 1,game:'stop'});
		}
	}
}

// Helper Methods
//http://stackoverflow.com/questions/6163350/server-side-browser-detection-node-js
var isMobile = (function (req)
{
	return function (req)
	{
		var ua = req.headers['user-agent'],
			bMobile = false;
			
		if (/mobile/i.test(ua) ||
			/Android/.test(ua))
	    	bMobile = true;

		return bMobile;
	};
})();

//http://stackoverflow.com/questions/143847/best-way-to-find-an-item-in-a-javascript-array
var findInArray = (function (arr, obj)
{
	return function (arr, obj)
	{
	    return (arr.indexOf(obj)); // Return an index or -1 if not found
	};
})();

Object.size = function(obj) 
{
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
