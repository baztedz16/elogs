const express = require('express');
const PORT = process.env.PORT || 6553;
const app =  express();
const mysql = require('mysql');
var bodyParser = require('body-parser');
var cors = require('cors');
const path = require("path");
const multer = require("multer");

//--- profile image handler
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads"); //important this is a direct path fron our current file to storage location
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "--" + file.originalname);
    },
  });
  const upload = multer({ storage: fileStorageEngine });



//app user libraries
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(cors());
//Create Connection for mysql
/* const  db= mysql.createConnection({
    host    : 'remotemysql.com',
    user    : 'G8cYti6fdg',
    password: 'vJZT1rbdLX',
    database: 'G8cYti6fdg'
    })
db.connect((err) =>{
    if(err){
        console.log(err);
    }else{
        console.log('DB Connected');
    }
    
}) */
// var db = {
//   host    : 'remotemysql.com',
//   user    : 'G8cYti6fdg',
//   password: 'vJZT1rbdLX',
//   database: 'G8cYti6fdg'
// };
var db = {
    host    : 'sql622.main-hosting.eu',
    user    : 'u912192847_eloguser',
    password: 'P@ssw0rd!',
    database: 'u912192847_elogs'
  };

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }else{
        console.log('DB Connected');
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      handleDisconnect();                                  // server variable configures this)
    }
  });
}

handleDisconnect();


app.get('/',(req,res,next)=>{
    res.send('Done Connection');
})

app.post('/user',(req,res,next)=>{
    let sql = 'Select * FROM  acc_user';
    connection.query(sql, (err,result) =>{
        if(err) throw err;
        res.send(result);
    })
})
app.post('/login',(req,res,next)=>{
    let sql = `Select acc_user.id,acc_user.username,CONCAT(acc_user.fname," ",acc_user.mname," ", acc_user.lname) as name,acc_user.course,acc_user.section,acc_user.address,acc_user.email ,users.photo,tus.q1,tus.q2,tus.q3,tus.q4 ,tus.symptom1,tus.symptom2,tus.symptom3,tus.symptom4,tus.symptom5,tus.temp FROM acc_user LEFT JOIN users ON acc_user.email = users.email LEFT JOIN (SELECT * FROM tr_user_status order by id desc LIMIT 1) tus ON acc_user.id = tus.user_id where acc_user.username = '${req.body.username}' and acc_user.password = '${req.body.password}'`;
    connection.query(sql, (err,result) =>{
        
        //if(err) throw err;
        console.log("[mysql error]",err);
        
        if(result.length > 0){
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
                    address:result[0].address,
                    email:result[0].email,
                    photo:result[0].photo,
                    q1:result[0].q1,
                    q2:result[0].q2,
                    q3:result[0].q3,
                    q4:result[0].q4,
                    symptom1:result[0].symptom1,
                    symptom2:result[0].symptom2,
                    symptom3:result[0].symptom3,
                    symptom4:result[0].symptom4,
                    symptom5:result[0].symptom5,
                    temp:result[0].temp,

                  }
              },
              endingMessage:"Geo Server !!!"
            }
            res.send(responseData);
        }else{
            responseData = {
              message:"Error login",
            endingMessage:"Geo Server !!!"
          }
          
            res.send(responseData);
        }
        
    })
})
app.post('/register',(req,res,next)=>{
    let sql = `INSERT INTO acc_user (username, password,fname,mname,lname) VALUES ('${req.body.username}', '${req.body.password}', '${req.body.fname}', '${req.body.mname}', '${req.body.lname}')`;
    connection.query(sql, (err,result) =>{
        if(err) throw err;
        res.send("Succesfully Registered:"+req.body.username);
        
    })
})
app.post('/healthcheck',(req,res,next)=>{
  let sql = `INSERT INTO tr_user_status (user_id, q1,q2,q3,q4,symptom1,symptom2,symptom3,symptom4,symptom5,temp) VALUES
   ('${req.body.usersid}', '${req.body.q1}', '${req.body.q2}', '${req.body.q3}', '${req.body.q4}', '${req.body.symptom1}', '${req.body.symptom2}', '${req.body.symptom3}', '${req.body.symptom4}'
   , '${req.body.symptom5}', '${req.body.temp}')`;
  connection.query(sql, (err,result) =>{
      if(err) throw err;
      res.send("Health Check Updated:"+req.body.username);
      
  })
})
app.post('/Tarcelogs',(req,res,next)=>{
    let sql = `INSERT INTO tr_logs (user_id,location,q1,q2,q3,q4,fever,cough,bodypains,breathing,sorethroat,temp) VALUES ('${req.body.user}','${req.body.location}','${req.body.q1}','${req.body.q2}','${req.body.q3}','${req.body.q4}','${req.body.symptom1}','${req.body.symptom2}','${req.body.symptom3}','${req.body.symptom4}','${req.body.symptom5}','${req.body.temp}')`;
    connection.query(sql, (err,result) =>{
        if(err) throw err;
        console.log(result);
        res.send(sql);
        
    })
})
app.post('/insertvisitor',(req,res,next)=>{
    let sql = `INSERT INTO acc_user (fname,password,username) VALUES ('${req.body.name}','${req.body.password}','${req.body.phone}')`;
    connection.query(sql, (err,result) =>{
        if(err) throw err;
        console.log(result);
        res.send(result);
        
    })
})
app.post('/feedback',(req,res,next)=>{
  let sql = `INSERT INTO feedback (uid,subject,feedback) VALUES ('${req.body.uid}','${req.body.subject}','${req.body.feedback}')`;
  connection.query(sql, (err,result) =>{
      if(err){
        res.send("Error Insert");
      }else{
        console.log(result);
        res.send(result);
      }
      
      
  })
})
app.get('/TarcelogsHistory',(req,res,next)=>{
    let sql = `Select MAX(tr_logs.id) AS id,tr_logs.user_id AS user_id,tr_logs.location AS location,DATE_FORMAT(tr_logs.time,"%Y %M %D") AS time,mf_location.location_name AS location_name ,MAX(logsdetails.entry) as entry,MIN(logsdetails.exito) as exito
    from tr_logs left join mf_location on(tr_logs.location = mf_location.id)
    LEFT JOIN (Select user_id as id,DATE(MAX(time)) as DATE,MIN(TIME(time)) as entry,CASE WHEN MAX(TIME) = MIN(time) THEN 'NO RECORD' ELSE MAX(TIME(time)) END as exito FROM tr_logs GROUP BY user_id,DATE(time)) logsdetails  
    ON logsdetails.id = tr_logs.user_id 
    where tr_logs.user_id = '${req.param("user")}'
    GROUP BY tr_logs.user_id,tr_logs.location,DATE_FORMAT(tr_logs.time,"%Y %M %D"),mf_location.location_name order by DATE_FORMAT(tr_logs.time,"%Y %M %D")`;
    connection.query(sql, (err,result) =>{
        if(err) throw err;
        console.log(result);
        res.send(result);
        
    })
})
app.post('/TarcelogsHistory',(req,res,next)=>{
    let sql = `SELECT * FROM vw_trlogs where user_id = '${req.param("user")}' `;
    connection.query(sql, (err,result) =>{
        if(err) throw err;
        console.log(res);
        res.send(result);
        
    })
})
app.post('/Questioner',(req,res,next)=>{
    let sql = `SELECT * FROM mf_questioner where question_pos = '${req.param("position")}' order by id desc LIMIT 1;`;
    connection.query(sql, (err,result) =>{
        if(err) throw err;
        console.log(res);
        res.send(result);
        
    })
})
app.post("/profile", upload.single("file"), (req, res) => {
    console.log(req.file);
    res.send("Single FIle upload success");
  });

app.listen(PORT);
console.log('AlbApi API is runnning at ' + PORT);