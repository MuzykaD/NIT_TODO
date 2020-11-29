var Entity = require('../models/entityModel');
var Topic = require('../models/topicModel');
var Event = require('../models/eventModel');
var Deadline = require('../models/deadlineModel');
var Color = require('../models/colorModel');

exports.entityList = function (req, res) {

    let user = req.currentUser;

    Entity.find({user: user._id}).populate('topic').populate('color')
        .exec(function (err, entities) {
            if (err) {
                return next(err);
            }

            Topic.find({user: user._id}).populate('color')
                .exec(function (err, topics) {
                    if (err) {
                        console.log(err);
                    }

                    if (req.baseUrl.match(/api/)) {
                        res.send({ entities: JSON.stringify(entities) });
                    } else {
                        res.render('entity/entityList', {title: 'Entities list', entities: entities, topics: topics});
                    }
                });
        });
};

exports.entityDetail = function (req, res) {

    let user = req.currentUser;
    let entityId = req.params.id;

    Entity.find({user: user._id, _id: entityId}).populate('color')
        .exec(function (err, entity) {
            if (err) console.log(err);

            Event.find({user: user._id, entity: entity[0]._id})
                .exec(function (err, events) {
                    if (err) console.log(err);

                    Deadline.find({user: user._id, entity: entity[0]._id})
                        .exec(function(err,deadlines){
                            if(err){
                                console.log(err);
                            }

                            if (req.baseUrl.match(/api/)) {
                                res.send({entity: JSON.stringify(entity[0]), events: JSON.stringify(events), deadlines: JSON.stringify(deadlines)});
                            } else {
                                res.render('entity/entityDetail', {title: 'Entity', entity: entity[0], events: events, deadlines: deadlines});
                            }
                        });
                });
        });
};

// виводимо форму для створення нового запису
exports.entityAddGet = function (req, res) {

    let user = req.currentUser;
    let topicId = req.params.topicId??0;

    // список всіх topics авторизованого юзера
    Topic.find({user: user._id})
        .exec(function (err, topics) {
            if (err) console.log(err);

            Color.find({})
                .exec(function (err, colors) {
                    if (err) console.log(err);

                    res.render('entity/entityAdd', {title: 'Add entity', topics: topics, topicId: topicId, colors: colors});
                });
        });
}

exports.entityAdd = function (req, res) {

    let name = req.body.name;
    let topic = req.body.topic;
    let color = req.body.color;
    let user = req.currentUser;

    var entity = new Entity({name: name, topic: topic, user: user, color: color});

    entity.save(function(err){
        if(err) console.log(err);
    })

    if (req.baseUrl.match(/api/)) {
        res.send('');
    } else {
        res.redirect('/entity');
    }
};

// виводимо форму для редагування
exports.entityEdit = function (req, res) {

    let entityId = req.params.id;

    Entity.findById(entityId).exec(function (err, entity) {
        if (err) {
            if (err) console.log(err);
        }

        let user = req.currentUser;

        // список всіх topics авторизованого юзера
        Topic.find({user: user._id})
            .exec(function (err, topics) {
                if (err) console.log(err);

                Color.find({})
                    .exec(function (err, colors) {
                        if (err) console.log(err);

                        res.render('entity/entityEdit', {title: 'Edit entity', entity: entity, topics: topics, colors: colors});
                    });
            });
    });
};

exports.entityUpdate = function (req, res) {

    let name = req.body.name;
    let topic = req.body.topic;
    let color = req.body.color;

    var entity = new Entity({name: name, topic: topic, color: color, _id: req.params.id});

    Entity.findByIdAndUpdate(req.params.id, entity, {}, function(err, entity){
        if(err) console.log(err);

        if (req.baseUrl.match(/api/)) {
            res.send('');
        } else {
            res.redirect('/entity/'+entity._id);
        }
    });
};

exports.entityDelete = function (req, res) {

    if (req.baseUrl.match(/api/)) {
        res.send('');
    } else {
        res.render('index', {title: 'Scheduler - entity delete'});
    }
};
