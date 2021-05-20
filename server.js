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
	let match_data = []

	let admin_id_from_session = []
	let user_listen_song = [];
	let ar;

	let user_id;
	var i;
	var idds = "";


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


	var initial_result;

	io.sockets.on('connection', function (socket) {
		
	  let song_name;
	  let song_artist;
	  let song_uri;
	  let song_image;
	  let song_names;
	  let song_artists;
	  let song_uris;
	  let song_images;
	  let current_date, dd, mm, yyyy, time;
	  let today, curdate;
	  /*
	  socket.on('host_detail', function (hostId) {
	    console.log('gelen host : ' + hostId);

	    setInterval(function () {
	      db.query("SELECT token,id FROM users where id =" + hostId + " ", function (err, rows) {
	        if (err) throw err;
	        rows.forEach(result => {

	          var options = {
	            method: 'GET',
	            url: 'https://api.spotify.com/v1/me/player/currently-playing?market=TR&additional_types=episode',
	            headers: {
	              authorization: 'Bearer ' + result['token']
	            }
	          };

	          axios.request(options).then(function (response) {
	            if (response != null) {

	              if (song_names != response.data['item']['name'] && song_artists != response.data['item']['album']['artists'][0]['name']) {
	                song_names = response.data['item']['name'];
	                song_uris = response.data['item']['uri'];
	                song_images = response.data['item']['album']['images'][0]['url'];
	                song_artists = response.data['item']['album']['artists'][0]['name'];
	                console.log(' çalan :  ' + song_names + ' - ' + song_artists);

	                setInterval(function () {
	                  socket.emit('current_song', song_names + ' - ' + song_artists + ' - ' + song_images + ' - ' + song_uris + ' - ' + hostId);
	                }, 5000);

	              }

	            }

	          }).catch(function (error) {
	            //console.error(error);
	          });
	        })
	      });


	    }, 10000);

	  });
*/

	  socket.on("register", function (adminId) {

	    socketUsers[socket.id] = adminId;

	    console.log("Socket registered_admin: ", socketUsers[socket.id]);

	    if ( socketUsers[socket.id] == null) {

	    } else {

	      setInterval(function () {
		      
		    if ( socketUsers[socket.id] == null) {
	
		    } else {		      
		      
		      
	        db.query("SELECT token,id FROM users where id =" + socketUsers[socket.id] + " ", function (err, rows) {
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
							//socket.broadcast.emit('match_song',result['id'] +" : has joined the chat ");
						
	                      current_date = new Date()
	                      dd = String(current_date.getDate()).padStart(2, '0');
	                      mm = String(current_date.getMonth() + 1).padStart(2, '0'); //January is 0!
	                      yyyy = current_date.getFullYear();
	                      time = current_date.toLocaleTimeString('tr-TR');
	                      today = yyyy + '-' + mm + '-' + dd + ' ' + time;
	
	                      db.query('SELECT * FROM user_match_song WHERE user_one=' + result['id'] + ' DATE_FORMAT(proccess_time, "Y-%m-%d %H:%i")=' + today, function (errv, rowv) {
	                        if (rowv && rowv.length) {
	
	                        } else {
	                          var records = [
	                            [result['id'], song_uri, song_image, song_name, song_artist, today]
	                          ];
	                          db.query("INSERT INTO user_song_preview (user_id, song_uri,song_image,song_name,song_artist,proccess_time) VALUES ?", [records], function (err, resultsss, fields) {
	                            if (err) throw err;
	                            
	                          });
	                          
	                          setInterval(function () {
		                          
		                          db.query("SELECT  a.user_id as one, b.user_id as two FROM user_song_preview a JOIN user_song_preview b ON a.song_uri = b.song_uri AND a.user_id != b.user_id  AND DATE_FORMAT(a.proccess_time, '%Y-%m-%d %H:%i') = DATE_FORMAT(b.proccess_time, '%Y-%m-%d %H:%i')   AND DATE_FORMAT(a.proccess_time, '%Y-%m-%d %H:%i')= DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i') AND DATE_FORMAT(b.proccess_time, '%Y-%m-%d %H:%i')= DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i')  ", function (err, rowse) {
	                              if (err) throw err;
	                              rowse.forEach(response_row => {
	
	
	                                var para = [
	                                  [response_row['one'], response_row['two'], song_uri, song_image, song_name, song_artist, '0', today]
	                                ];
	                                db.query('SELECT * FROM user_match_song WHERE user_one=' + response_row['one'] + ' and user_two =' + response_row['two'], function (err, row) {
		                                
	                                  if (row && row.length) {
	                                   	
	                                    // do something with your row variable
	                                  } else {
	                                   
										
	                                    db.query("INSERT INTO user_match_song (user_one, user_two,song_uri, song_image, song_name, song_artist,status,proccess_time) VALUES ?", [para], function (erro, rress, fieldss) {
	                                      if (erro) throw erro;
	                                    });
										//socket.emit('match_song',socket.id +" : old ");
	                                  }
	                                });
									  
	
										  
									 
										  	
	
	                              })
	                            });
	                          
								}, 1000);
	
	                        }
	
	                      });
	                      
						 
	
	                    }
	
	                  }
	
	                }).catch(function (error) {
	                  //console.error(error);
	                });
	              }
	
				  
				let count=0;
				let responsev = [];
				db.query('SELECT * FROM user_match_song WHERE  user_one= ' + result['id'] +' AND (proccess_time between proccess_time AND proccess_time - INTERVAL 5 MINUTE OR proccess_time between proccess_time AND proccess_time)', function (errv, rowvc) {
					 if (rowvc && rowvc.length) {
				    	rowvc.forEach(response_v => {
				            
				            db.query("SELECT  id, display_name, images,username FROM users where id=" + response_v['user_two'], function (erru, rows_user_info) {
				              if (erru) throw erru;
				              rows_user_info.forEach(response_rows_user_info => {
				            
							  
				            
				                match_data.push({
				                    
							        "id" : response_rows_user_info.id,
							        "display_name"  : response_rows_user_info.display_name,
							        "username"  : response_rows_user_info.username,
							        "user_image" : response_rows_user_info.images,
									"user_two":response_v.user_two,
									"song_uri":response_v.song_uri,
									"song_name":response_v.song_name,
									"song_artist":response_v.song_artist,
									"song_image":response_v.song_image,
									"status":response_v.status,
									"match_id":response_v.match_id
							    });
							    
				            
				            
				              })
				              
				            });
				  
						})
				    	 
				    //console.log('{"data":'+ JSON.stringify(match_data) +'}');
				    socket.emit('have_match','{"data":'+ JSON.stringify(match_data) +'}');
					 }
					 else{
						 socket.emit('match_song','match');
					 }
					
				    match_data.splice(0,match_data.length);                 
				    				    
				});
	
	
	
	            }).catch(function (error) {
	              console.log('get_token', 'get token bro');
	              socket.emit('get_token', 'get token bro');
	            });
	            
	            
	            
	            
	            
	
	          })
	        });
	        
	        
	        	        
	
			 }
	
	      }, 10000);

	    }
	  });




	  socket.on('disconnect', function () {
	    console.log('Disconnect received from ID: ' + socketUsers[socket.id]);
	    delete socketUsers[socket.id];
	  });
	});


	server.listen(3000, () => {
	  console.log('listening on *:3000');
	});
