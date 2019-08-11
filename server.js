const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: '13755731',
        database: 'LeaderboardsDB'
    }
});


const app = express();

app.use(cors());
app.use(bodyParser.json());

var PORT = process.env.PORT || 3000;

app.get('/snowtrip', (req, res) => {
    db("snowtrip").select('*').orderBy('score', "desc").then((records) => {
        var Leaderboard = { "Records": records };
        return res.json(Leaderboard);
    }).catch(err => res.status(400).json('Unable to get leaderboard'));
});

app.get('/snowtrip/user/:id', (req, res) => {
    const { id } = req.params;
    // console.log(id);

    db("snowtrip").select('username').where('deviceid', id).then((records) => {
        //var Leaderboard = { "Records": records };
        if (records[0]) {
            return res.send(records[0].username);
        } else {
            return res.send("");
        }
    }).catch(err => res.status(400).json('Unable to get username'));
});

app.post('/snowtrip', (req, res) => {
    const { deviceid, username, score } = req.body;
    //search through db and if there already exists, then update the score with higher value
    //also update the username with the one provided in req.body.
    //if its new, insert new row.
    db("snowtrip").select("deviceid", "score").where("deviceid", deviceid)
        .then(record => {
            if (record[0]) {
                if (Number(record[0].score) < Number(score)) {
                    db("snowtrip").where("deviceid", deviceid).update({
                        'score': score
                    }).catch(err => res.status(400).json('Unable to Update Score'))
                }
                db("snowtrip").where("deviceid", deviceid).update({
                    'username': username
                }).then(() => {
                    db("snowtrip").select('*').orderBy('score', "desc").then((records) => {
                        var Leaderboard = { "Records": records };
                        return res.json(Leaderboard);
                    })
                }).catch(err => res.status(400).json('Unable to update Username'))

            } else {
                db("snowtrip").insert({
                    'deviceid': deviceid,
                    'username': username,
                    'score': score
                }).then(() => {
                    db("snowtrip").select('*').orderBy('score', "desc").then((records) => {
                        var Leaderboard = { "Records": records };
                        return res.json(Leaderboard);
                    }).catch(err => res.status(400).json('Unable to get leaderboard'));

                }).catch(err => res.sgittatus(400).json('Unable to insert new record'))
            }
        }).catch(err => res.status(400).json('Unable to serch through db'))
});


app.listen(PORT, () => {
    console.log('App is running on port 3000');
});

