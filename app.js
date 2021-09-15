const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressLayout = require('express-ejs-layouts');
const rateLimit = require("express-rate-limit");
const passport = require('passport');
const flash = require('connect-flash');
const MemoryStore = require('memorystore')(session);

const apiRouters = require('./routes/api');
const userRouters = require('./routes/users');

const { isAuthenticated } = require('./lib/auth');
const { connectMongoDb } = require('./database/connect');
const { getApikey } = require('./database/db');
const { port } = require('./lib/settings');

const PORT = process.env.PORT || port;

connectMongoDb();

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100, 
  message: 'Oops too many requests'
});
app.use(limiter);
app.set('view engine', 'ejs');
app.use(expressLayout);
app.use(express.static('public'));

app.use(session({
  secret: 'secret',  
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
require('./lib/config')(passport);

app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
})

app.get('/', (req, res) => {
  res.render('index', {
    layout: 'layouts/main'
  });
});

app.get('/docs', isAuthenticated, async (req, res) => { 
  let getkey = await getApikey(req.user.id)
  let { apikey, username } = getkey
  res.render('docs', {
    username: username,
    apikey: apikey,
    layout: 'layouts/main'
  });
});
app.get('/cekip', async(req, res) {
  console.log(req.headers);
  res.json({ 
  ipaddress : req.headers["x-forwarded-for"] || req.headers.remoteAddress, 
  language : req.headers["accept-language"].split(",")[0], 
  opsystem : req.headers["user-agent"].split("(")[1].split(")")[0]
  });
});
app.use('/api', apiRouters);
app.use('/users', userRouters);
app.set('json spaces', 4);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
