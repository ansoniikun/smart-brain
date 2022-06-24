const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');

const db = knex({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user: 'postgres',
        password: 'test',
        database: 'smart-brain'
    }
});

db.select('*').from('users').then(data => {
    console.log(data)
});

const app = express();

//MIDDLEWARE
app.use(express.json())
app.use(cors())

//HOME
app.get('/', (req, res) => {
    res.send('success');
})

//SIGNIN
app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
      .where('email', '=', req.body.email)
      .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if (isValid) {
          return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
              res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
          res.status(400).json('wrong credentials')
        }
      })
      .catch(err => res.status(400).json('wrong credentials'))
  })

//REGISTER
app.post('/register', (req, res) =>{
    const { email, name, password } = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        }).into('login').returning('email')
        .then(loginEmail => {
        return trx('users')
         .returning('*')
         .insert({
          email: loginEmail[0].email,
          name: name,
          joined: new Date()
         }).then(user => {
            res.json(user[0]);
        })
    })
     .then(trx.commit)
     .catch(trx.rollback)   
})
.catch(err => res.status(400).json('Unable to register'))
   
  
})

//PROFILE
app.get('/profile/:id', (req, res) =>{
    const { id } = req.params;
    let found = false;
   db.select('*').from('users').where({id})
   .then(user => {
    if (user.length) {
        res.json(user[0])
    } else {
        res.status(400).json('not found')
    }
    
   }).catch(err => res.status(400).json('error getting user'))
    // if (!found) {
    //     res.status(400).json('not found')
    // }
})

//IMAGE
app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    }).catch(err=> res.status(400).json('unable to get entries'))
})

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3001, ()=> {
console.log('app is running on port 3001');
})

/*
/ --> res = this is working
/signin --> POST = success/fail
/regist --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user


*/