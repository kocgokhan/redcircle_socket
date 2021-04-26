<script src="https://www.spotisocket.krakersoft.com/node_modules/socket.io-client/dist/socket.io.js"></script>
<script>
	

	const socket = io.connect("https://www.spotisocket.krakersoft.com:3000", { secure: true,reconnection: true});
	socket.on('connect', function () 
	{
		console.log(socket.connected);
		socket.emit('refresh');
		socket.emit("register","2");
		
		socket.on('disconnect', function() {
			//console.log("Socket disconnected.");
		});
		
		
		socket.on("event", function(message) 
		{ 
			console.log(message);
		});		
	});


</script>