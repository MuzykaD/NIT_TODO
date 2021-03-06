var Topic = require('../models/topicModel');
var Entity = require('../models/entityModel');
var Color = require('../models/colorModel');

exports.topicList = function (req, res) {

    let user = req.currentUser;

    Topic.find({user: user._id})
    .exec(function (err, topics) {
        if (err) {
            console.log(err);
        }

        if (req.baseUrl.match(/api/)) {
            res.send({ topics: JSON.stringify(topics) });
        } else {
            res.render('topic/topicList', {title: 'Topics list', topics: topics});
        }
    });
};

exports.topicEventsList = function (req, res) {

    if (req.baseUrl.match(/api/)) {
        res.send('');
    } else {
        res.render('index', {title: 'Scheduler'});
    }
};

exports.topicDetail = function (req, res) {

    let user = req.currentUser;
    let topicId = req.params.id;

    Topic.find({user: user._id, _id: topicId})
        .exec(function (err, topic) {
            if (err) console.log(err);

            Entity.find({user: user._id, topic: topic[0]._id})
                .exec(function (err, entities) {
                    if (err) console.log(err);

                    if (req.baseUrl.match(/api/)) {
                        res.send({topic: JSON.stringify(topic[0]), entity: JSON.stringify(entities)});
                    } else {
                        res.render('topic/topicDetail', {title: 'Topic', topic: topic[0], entities: entities});
                    }
                });
        });
};

// виводимо форму для створення нового запису
exports.topicAddGet = function (req, res) {

    Color.find({})
        .exec(function (err, colors) {
            if (err) console.log(err);

            res.render('topic/topicAdd', {title: 'Add topic', colors: colors});
        });
}

exports.topicAdd = function (req, res) {

    let name = req.body.name;
    let color = req.body.color;

    // юзер у нас завжди доступний після авторизації
    let user = req.currentUser;

    var topic = new Topic({name: name, user: user, color: color});

    topic.save(function(err){
        if(err) console.log.err;
    });

    if (req.baseUrl.match(/api/)) {
        res.send('');
    } else {
        res.redirect('/entity');
    }
};

// виводимо форму для редагування
exports.topicEdit = function (req, res) {

    let topicId = req.params.id;

    Topic.findById(topicId).exec(function (err, topic) {
        if (err) {
            if (err) console.log(err);
        }

        Color.find({})
            .exec(function (err, colors) {
                if (err) console.log(err);

                res.render('topic/topicEdit', {title: 'Edit topic', topic: topic, colors: colors});
            });
    });
};

exports.topicUpdate = function (req, res) {
    
    let name = req.body.name;
    let color = req.body.color;

    // юзер у нас завжди доступний після авторизації
    let user = req.currentUser;

    var topic = new Topic({name: name, user: user, color: color, _id: req.params.id});

    Topic.findByIdAndUpdate(req.params.id, topic, {}, function(err, topic){
        if(err) console.log(err);

        if (req.baseUrl.match(/api/)) {
            res.send('');
        } else {
            res.redirect('/entity');
        }
    });
};

exports.topicDelete = function (req, res) {

    var topicId = req.params.id;

    Topic.findByIdAndDelete(topicId).exec(function (err, topic) {
        if (err) {
            if (err) console.log(err);
        }

        res.json({});
    });
};