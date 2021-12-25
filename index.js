var express = require('express');
var CryptoJS = require("crypto-js");
var app = express();

// MySQL settings
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "mysql",
    database: "mysql",
    user: "root",
    password: "ccrnjuhnuyrkceghisncuyrsgheknc",
    multipleStatements: true
});

app.use(express.urlencoded());


// Connect to the database
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

// Routing
app.get('/', function (req, res) {
    res.sendFile('views/home.html', { root: __dirname })
});

// Routing API
app.post('/api/submit', function (req, res) {

    const SHA256Regex = new RegExp("^[A-Fa-f0-9]{64}$");

    var inputHash = req.body.hash;

    // Check if the input is a valid SHA256 hash
    if (SHA256Regex.test(inputHash) == false) {
        return res.status(422).json({ message: "Not a valid SHA256 hash" });;
    }

    // Check if hash already exists in DB
    con.query(`SELECT * FROM hashes WHERE hash = ${mysql.escape(inputHash)}`, function (err, result) {

        // Hash is already present in the database
        if (result && result.length) {
            return res.status(422).json({ message: "Hash already exists in the database" });
        }

        con.query(`INSERT INTO hashes (hash) VALUES (${mysql.escape(inputHash)})`, function (err, result) {
            if (err) throw err;
            return res.status(200).json({ message: "Hash added to the database" });
        });
    });

});

app.post('/api/verify', function (req, res) {

    // Extract raw text from JSON POST request
    var inputText = req.body.text;

    // Input text too long
    if (inputText.length > 5000) {
        return res.status(422).json({ message: "Input text too long" });
    }

    // Remove characters that are not allowed in SHA256
    var cleanInputText = inputText.replace(/[^a-zA-Z0-9 ]/g, "");

    // Hash the outcome
    var hash = CryptoJS.SHA256(cleanInputText).toString(CryptoJS.enc.Hex);

    // Check if hash actually exists
    con.query(`SELECT * FROM hashes WHERE hash = ${mysql.escape(hash)}`, function (err, result) {

        // Hash is not found
        if (result && result.length == false) {
            return res.status(422).json({ message: "Hash is not found" });
        }

        // Hash is found but already verified
        if (result[0].date_verified !== null) {
            return res.status(422).json({ message: "Hash is found but already verified" });
        }

        // Hash found and not yet verified
        con.query(`UPDATE hashes SET raw_input = ${mysql.escape(cleanInputText)}, date_verified = CURRENT_TIMESTAMP WHERE id = ${mysql.escape(result[0].id)}`, function (err, result) {
            return res.status(200).json({ message: "Hash solution added to the database" });
        });

    });
});

app.get('/api/homepage-hashes', function (req, res) {


    con.query(`SELECT * FROM hashes ORDER BY id DESC LIMIT 10; SELECT * FROM hashes WHERE date_verified IS NOT NULL ORDER BY date_verified DESC LIMIT 10`, function (err, result) {
        if (result && result.length) {
            latest_submitted = result[0];
            latest_verified = result[1];
            return res.status(200).json({ latest_submitted, latest_verified });
        }
        return res.status(200);
    });

});



// Port listening
app.listen(3000);