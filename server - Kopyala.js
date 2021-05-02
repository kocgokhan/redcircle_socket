	"use strict";
	var path = require('path');
	const fs = require('fs');
	const express = require('express');
	const app = express();
	const server = require('https').createServer({
	  key: fs.readFileSync('key.pem'),
	  cert: fs.readFileSync('cert.pem')
	}, app);
	/*.createServer();*/
	var axios = require("axios").default;

	const mysql = require("mysql");
	const db = mysql.createConnection({
	  host: "localhost",
	  user: "red_circle",
	  password: "3gDm6d4!",
	  database: "red_circle"
	})

	const options = {};
	const io = require('socket.io')(server, options);
	var bodyParser = require('body-parser');

	app.use(bodyParser.urlencoded({
	  extended: true
	}));

	let socketUsers = []

	let admin_id_from_session = []
	let user_listen_song = [];
	let ar;

	let user_id;
	var i;
	var idds = "";

	var today, curdate;

	Date.isLeapYear = function (year) {
	  return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
	};

	Date.getDaysInMonth = function (year, month) {
	  return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	};

	Date.prototype.isLeapYear = function () {
	  return Date.isLeapYear(this.getFullYear());
	};

	Date.prototype.getDaysInMonth = function () {
	  return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
	};

	Date.prototype.addMonths = function (value) {
	  var n = this.getDate();
	  this.setDate(1);
	  this.setMonth(this.getMonth() + value);
	  this.setDate(Math.min(n, this.getDaysInMonth()));
	  return this;
	};

	let unique = [];
	const findDuplicates = (arr) => {
	  let sorted_arr = arr.slice().sort(); // You can define the comparing function here. 
	  // JS by default uses a crappy string compare.
	  // (we use slice to clone the array so the
	  // original array won't be modified)
	  let results = [];
	  for (let i = 0; i < sorted_arr.length - 1; i++) {
	    if (sorted_arr[i + 1] == sorted_arr[i]) {
	      results.push(sorted_arr[i]);
	    }
	  }
	  return results;
	}

	var initial_result;
	io.sockets.on('connection', function (socket) {
	  console.log('Socket connected. ID: ' + socket.id);
	  socket.on('refresh', function () {
	    console.log('Refresh received from ID: ' + socket.id);
	  });

	  var toExactMinute = 60000 - (new Date().getTime() % 60000);
	  var song_name = '';
	  var song_artist = '';
	  var song_uri = '';
	  var song_image = '';
		var matches = '';
	  var current_date, dd, mm, yyyy, time;

	  var current_dates, dds, mms, yyyys, time, times, date1, date2, date3;

	  socket.on("register", function (adminId) {
	    console.log("Socket registered_admin: ", adminId);
	    socketUsers.push({
	      adminId,
	      socket,
	      socketId: socket.id
	    })

	    setInterval(function () {
	      db.query("SELECT token,id FROM users where id =" + adminId + " ", function (err, rows) {
	        if (err) throw err;
	        rows.forEach(result => {


	          var optionss = {
	            method: 'GET',
	            url: 'https://api.spotify.com/v1/me',
	            headers: {
	              authorization: 'Bearer ' + result['token']
	            }
	          };

	          axios.request(optionss).then(function (responses) {
	            if (responses != null) {

	              var options = {
	                method: 'GET',
	                url: 'https://api.spotify.com/v1/me/player/currently-playing?market=TR&additional_types=episode',
	                headers: {
	                  authorization: 'Bearer ' + result['token']
	                }
	              };

	              axios.request(options).then(function (response) {
	                if (response != null) {

	                  if (song_name != response.data['item']['name'] && song_artist != response.data['item']['album']['artists'][0]['name']) {
	                    song_name = response.data['item']['name'];
	                    song_uri = response.data['item']['uri'];
	                    song_image = response.data['item']['album']['images'][0]['url'];
	                    song_artist = response.data['item']['album']['artists'][0]['name'];
	                    console.log(song_name + ' - ' + song_artist);
	                    socket.emit('event', song_name + ' - ' + song_artist);


	                    current_date = new Date()
	                    dd = String(current_date.getDate()).padStart(2, '0');
	                    mm = String(current_date.getMonth() + 1).padStart(2, '0'); //January is 0!
	                    yyyy = current_date.getFullYear();
	                    time = current_date.toLocaleTimeString('tr-TR');
	                    today = yyyy + '-' + mm + '-' + dd + ' ' + time;

	                    var records = [
	                      [result['id'], song_uri, song_image, song_name, song_artist, today]
	                    ];
	                    db.query("INSERT INTO user_song_preview (user_id, song_uri,song_image,song_name,song_artist,proccess_time) VALUES ?", [records], function (err, resultsss, fields) {
	                      // if any error while executing above query, throw error
	                      if (err) throw err;
	                      // if there is no error, you have the result
							
	                    });

	                    


	                  }

	                }

					
	              }).catch(function (error) {
	                //console.error(error);
	              });
					
				
	            }
				
	
	          }).catch(function (error) {
	            console.log('get_token', 'get token bro');
	            socket.emit('get_token', 'get token bro');
	          });

	        })
	      });


	    }, 10000);

		  setInterval(function () {

				db.query("SELECT *,DATE_FORMAT(proccess_time, '%Y-%m-%d %H:%i') as normal_date_one FROM user_song_preview where user_id!=" + adminId + " and DATE_FORMAT(proccess_time, '%Y-%m-%d %H:%i')= DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i')", function(err, resultssss) {
					if(err) { throw new Error('Failed');}
					console.log('diger id ler =>', resultssss['user_id']);

				});

				function Changed(pre, now) {
			  // return true if pre != now
				}


			}, 1000); 
		  
		  
	  });

	  socket.on('disconnect', function () {
	    console.log('Disconnect received from ID: ' + socket.id);
	    const index = socketUsers.findIndex(socketUser => socketUser.socketId === socket.id)
	    if (index === -1) {
	      return;
	    }
	    socketUsers.splice(index, 1)

	  });


	});


	server.listen(3000, () => {
	  console.log('listening on *:3000');
	});


	/*
					db.query("SELECT *,DATE_FORMAT(proccess_time, '%Y-%m-%d %H:%i') as normal_date_one FROM user_song_preview where user_id="+ adminId +"  ",function(err,rowse){
						if(err) throw err;
							rowse.forEach(response_row=>{
								
								
								db.query("SELECT *,DATE_FORMAT(proccess_time, '%Y-%m-%d %H:%i') as normal_date_two FROM user_song_preview where user_id!="+ adminId +" ",function(errs,rowses){
								if(errs) throw errs;
									rowses.forEach(response_two=>{
																			
										if(response_two['song_uri']==response_row['song_uri'] ){
											//console.log(response_two['song_uri']+'--'+response_row['normal_date_one']+'--'+response_two['normal_date_two']);
											
											date1 = new Date(response_two['normal_date_two']);
											date2 = new Date(response_row['normal_date_one']);
									
											current_dates = new Date()
											dds = String(current_dates.getDate()).padStart(2, '0');
											mms = String(current_dates.getMonth() + 1).padStart(2, '0'); //January is 0!
											yyyys = current_dates.getFullYear();
											times = current_dates.toLocaleTimeString('tr-TR');
											curdate =   yyyys + '-'+ mms + '-' + dds + ' ' + times.slice(0, -3);
											
											
											date3 = new Date(curdate);
									
											if(date1.valueOf() ==  date2.valueOf() ){
											  
												if( date2.valueOf() == date3.valueOf()){
												  
												    console.log('ok');
											        socket.emit('match_song',response_two);
													
												}
											}
											
										
										}
										
										
									})			     
								});							
								
								
							})			     
						});
	*/
