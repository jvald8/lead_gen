require('dotenv').config();
// require the .env variables

var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DB,
	port: process.env.MYSQL_PORT
});

/*pool.getConnection(function(err, connection) {
	console.log({err:err})
	connection.query(`SELECT * FROM users`, function(err, rows, fields) {
		if(err) {console.log({err:err})};
		if(rows) {console.log({rows:rows})};
		return;
	})
})*/

exports.findById = function(id, cb) {
  process.nextTick(function() {
  	pool.getConnection(function(err, connection) {
  		connection.query(`SELECT * FROM users WHERE user_id=${id}`, function(err, rows, fields) {
  			if(rows) {
  				cb(null, rows);
  			} else {
  				cb(new Error(`User ${id} doesn't exist`));
  			}
  		})
  	});
  });
}

exports.findByEmail = function(email, cb) {
	console.log(email)

  process.nextTick(function() {

  	pool.getConnection(function(err, connection) {
  		connection.query(`SELECT * FROM users WHERE email=${email}`, function(err, rows, fields) {
  			console.log(err)
  			if(rows.email === email) {
  				return cb(null, record);
  			}
  			return cb(null, null);
  		})
  	});

  });
}

