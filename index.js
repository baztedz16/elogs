const express = require('express');
const PORT = process.env.PORT || 6553;
const app =  express();
const mysql = require('mysql');
var bodyParser = require('body-parser');
var multer  = require('multer')
var cors = require('cors');

//app user libraries
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(cors());
//--------------------------- for image upload settings
var upload = multer({ storage: storage })
app.use('/uploads', express.static('uploads'));
/// upload image to root dir
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })
///---upload image end settings


//Create Connection for mysql
const db = mysql.createConnection({
    host    : 'remotemysql.com',
    user    : 'G8cYti6fdg',
    password: 'vJZT1rbdLX',
    database: 'G8cYti6fdg'
    })
    var connection;

    function handleDisconnect() {
      connection = mysql.createConnection(db); // Recreate the connection, since
                                                      // the old one cannot be reused.
    
      connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
          console.log('error when connecting to db:', err);
          setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
      });                                     // process asynchronous requests in the meantime.
                                              // If you're also serving http, display a 503 error.
      connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
          handleDisconnect();                         // lost due to either server restart, or a
        } else {        
            handleDisconnect();                                   // connnection idle timeout (the wait_timeout
          throw err;                                  // server variable configures this)
        }
      });
    }
    setInterval(function () {
        db.query('SELECT 1');
    }, 5000);
    
    handleDisconnect();
db.connect((err) =>{
    if(err){
        handleDisconnect();
        console.log(err);
    }else{
        console.log('DB Connected');
    }
    
})

function handledDisconnect(){
    connection = mysql.createConnection(db);
}
app.get('/',(req,res,next)=>{
    res.send('Done Connection');
})

app.post('/user',(req,res,next)=>{
    let sql = 'Select * FROM  acc_user';
    db.query(sql, (err,result) =>{
        if(err) throw err;
        res.send(result);
    })
})
app.post('/login',(req,res,next)=>{
    let sql = `Select id,username,CONCAT(fname," ",mname," ", lname) as name,course,section,address FROM  acc_user where username = '${req.body.username}' and password = '${req.body.password}'`;
    db.query(sql, (err,result) =>{
        
        if(err) throw err;
        responseData = {
            message:"Successfully login",
          useretails:{
              name: "Sample",
              userid:"",
              username: req.body.username,
              data: {
                id:result[0].id,
                name:result[0].name,
                username:result[0].username,
                course:result[0].course,
                section:result[0].section,
                address:result[0].address
              }
          },
          endingMessage:"Geo Server !!!"
        }
        if(result.length > 0){
            res.send(responseData);
        }else{
            res.send(400);
        }
        
    })
})
app.post('/register',(req,res,next)=>{
    let sql = `INSERT INTO acc_user (username, password,fname,mname,lname) VALUES ('${req.body.username}', '${req.body.password}', '${req.body.fname}', '${req.body.mname}', '${req.body.lname}')`;
    db.query(sql, (err,result) =>{
        if(err) throw err;
        res.send("Succesfully Registered:"+req.body.username);
        
    })
})
app.post('/Tarcelogs',(req,res,next)=>{
    let sql = `INSERT INTO tr_logs (user_id,location) VALUES ('${req.body.user}','${req.body.location}')`;
    db.query(sql, (err,result) =>{
        if(err) throw err;
        console.log(result);
        res.send(result);
        
    })
})
app.post('/TarcelogsHistory',(req,res,next)=>{
    let sql = `SELECT * FROM vw_trlogs where user_id = '${req.param("user")}' `;
    db.query(sql, (err,result) =>{
        if(err) throw err;
        console.log(res);
        res.send(result);
        
    })
})

app.post('/profile', function (req, res, next) {
    // req.file is the `profile-file` file
    // req.body will hold the text fields, if there were any
    console.log(JSON.stringify(req.file))
    var response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    response += `<img src="${req.file.path}" /><br>`
    return res.send(response)
  })

app.listen(PORT);
console.log('AlbApi API is runnning at ' + PORT);