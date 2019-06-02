const app = require('express')();
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dateParse = require('date-fns/parse');

mongoose.connect('mongodb://localhost/FFNotify', { useNewUrlParser: true });
mongoose.connection.on('err', console.error.bind(console, 'DB connection error:'));
mongoose.connection.once('open', () => console.log('Connected to DB'));

const RecentNews = require('../db/models/RecentNews');

app.use(bodyParser.json());

app.get('/recentNews', (req, res) => {
    RecentNews.find((err, response) => {
        res.send(response);
    });
});

app.post('/recentNews', (req, res) => {
    // const date = dateParse('1:01 AM - 2 Jun 2019');
    
    // console.log('date:', date);
    // RecentNews.findOne({ 'name': 'twitter' }, (err, response) => {
    //     // add error checking
    //     console.log('recentNewsCollection:', response);

    //     const { recentNews } = response;

    //     recentNews.forEach(twitterUser => {
    //         twitterUser.tweets.forEach(tweet => {

    //         });
    //     });

    //     res.sendStatus(200);
    // });


    const recentNews = new RecentNews(req.body);
    
    recentNews.save((err, data) => {
        console.log('Saved:', data);
        res.sendStatus(200);
    });

});

app.listen(PORT, () => console.log('API Running on port', PORT));