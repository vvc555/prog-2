const express = require("express");
var logger = require('morgan');
const app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require("fs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const slugify = require('slugify');




const socketRoutes = require('./controller/socket');

mongoose.connect('mongodb://localhost/planeerija', { useNewUrlParser: true });

const Post = require('./models/post');

app.use(logger('dev'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/img', express.static('public/img'));
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));


app.get('/', (req, res) => {
    let mysort = {tahtaeg: 1};
    Post.find({tehtud: false }).sort(mysort).exec(function(err, postid) {
        //res.send(JSON.stringify(postid));
        res.locals.postid = postid;
        res.render('index');
    });
});

app.post('/search', (req, res) => {
    let mysort = {tahtaeg: 1};
    let query =  req.body.search ;
    console.log('otsiti: '+query);
    Post.find({kirjeldus:new RegExp(query, 'i') }).sort(mysort).exec(function(err, postid) {
        //res.send(JSON.stringify(postid));
        res.locals.postid = postid;

        res.render('index');
    });
});
app.get('/arhiiv', (req, res) => {
    let mysort = {tahtaeg: 1};
    Post.find({}).sort(mysort).exec(function(err, postid) {
        //res.send(JSON.stringify(postid));
        res.locals.postid = postid;
        res.render('index');
    });
});

app.get('/calendar', (req, res) => {
    res.render('calendar');
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.get ('/post/:id',(req, res) => {
    Post.findById(req.params.id, function(err, post){
        res.render('post', {
            post:post
        });
    });
    
});

app.get ('/edit/:id',(req, res) => {
    Post.findById(req.params.id, function(err, post){
        res.render('edit', {
            post:post
        });
    });
    
});

// uue sisestus
app.post('/inserted', (req, res) => {
    console.log(req.body);

    let newPost = new Post({
        aine: req.body.aine,
        tyyp: req.body.tyyp,
        pealkiri: req.body.pealkiri,
        kirjeldus: req.body.kirjeldus,
        tahtaeg: req.body.tahtaeg,
        prioriteet: req.body.prioriteet,
        meeldetuletus: req.body.meeldetuletus,
        slug: slugify(req.body.pealkiri)
    });

    newPost.save(function(err, savedPost) {
        if(err) {
            console.error(err);
            return res.send('error');
        }
        console.log(savedPost);
        res.render('inserted');
    });
});

// muutmise sisestus
app.post('/edited/:id', (req, res) => {
    console.log(req.body);

    let post = {
        aine: req.body.aine,
        tyyp: req.body.tyyp,
        pealkiri: req.body.pealkiri,
        kirjeldus: req.body.kirjeldus,
        tahtaeg: req.body.tahtaeg,
        prioriteet: req.body.prioriteet,
        meeldetuletus: req.body.meeldetuletus,
        slug: slugify(req.body.pealkiri)
    };
    let query = {_id:req.params.id}

    Post.updateOne(query, post, function(err, savedPost) {
        if(err) {
            console.error(err);
            return res.send('error');
        }
        console.log(savedPost);
        res.render('edited');
    })
});

// kustutamine
app.delete('/delete/:id', (req, res) => {
    console.log(req.body);
   
    let query = {_id:req.params.id}

    Post.deleteOne(query, function(err, deletedPost) {
        if(err) {
            console.error(err);
            return res.send('error');
        }
        console.log(deletedPost);
        res.render('deleted');
    })
});

app.get('/deleted', (req, res) => {
    res.render('deleted');
});

// checked
app.get('/check/:id', (req, res) => {
    // console.log(req.body);
    let query = {_id:req.params.id}
    var postc = {};
    
    Post.findOne(query).exec(function(err, postid) {

        console.log('kysitud objekt'+postid);
        if (postid.tehtud == 1) {
            console.log('oli true: '+postid.tehtud);
            postc.tehtud = 0;
            } else {
                console.log('oli false: '+postid.tehtud);
                postc.tehtud = 1;
            };
    
        console.log('uus staatus: '+postc);
        Post.updateOne(query, postc, function(err, savedPost) {
            if(err) {
                console.error(err);
                return res.send('error');
            }
            console.log(savedPost);                  
        });
        if(err) {
            console.error(err);
            return res.send('error');
        }
  
        res.render('checked');   
        
    });
});


app.get('/checked', (req, res) => {
    res.render('checked');
});

io.on('connection', (socket) => {
    let id = socket.id;

        console.log("user connected", id);
    // console.log(id);

    // harjutus
    socket.on('name', (name) => {
        console.log(name);
        socket.name = name;
        socket.broadcast.emit('join', socket.name + " liitus vestlusega");
    });
    
    socket.on('chat', (msg) => {
        // saadame kõikidele klientidele tagasi
        io.emit('chat', {name: socket.name, text: msg});
    });
    
    socket.on('disconnect', () => {
        // console.log(id);
        console.log("user disconnected", id);
    });
});



app.use('/socket', socketRoutes);


app.get('*', (req, res) => {
    res.render('404');
});

http.listen(3030, () => {
    console.log("Server kuulab porti 3030");
});


