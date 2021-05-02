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
	  console.log('Socket connected. ID: ' + socket.id);
	  socket.on('refresh', function () {
	    console.log('Refresh received from ID: ' + socket.id);
	  });

	  var song_name = '';
	  var song_artist = '';
	  var song_uri = '';
	  var song_image = '';
	  var current_date, dd, mm, yyyy, time;
	  var today, curdate;


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
	                    socket.emit('current_song', song_name + ' - ' + song_artist + ' - ' + song_image + ' - ' + song_uri);


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
	                              //console.log('No case row was found :( !');
									
	                              db.query("INSERT INTO user_match_song (user_one, user_two,song_uri, song_image, song_name, song_artist,status,proccess_time) VALUES ?", [para], function (erro, rress, fieldss) {
	                                // if any error while executing above query, throw error
	                                if (erro) throw erro;
									  
									

	                              });
									
									socket.emit('match_song','eşleşmen var kardeş !' );
									
	                            }

	                          });


	                        })
	                      });
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


	  });

	  socket.on('disconnect', function () {
	    console.log('Disconnect received from ID: ' + socket.id);
	    const index = socketUsers.findIndex(socketUser => socketUser.socketId === socket.id,)
	    if (index === -1) {
	      return;
	    }
	    socketUsers.splice(index, 1)

	  });


	});


	server.listen(3000, () => {
	  console.log('listening on *:3000');
	});


