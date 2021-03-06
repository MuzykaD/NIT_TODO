var Event = require('../models/eventModel');
var Entity = require('../models/entityModel');
var Topic = require('../models/topicModel');

exports.eventList = function (req, res) {

    let user = req.currentUser;

    Event.find({user: user._id}).populate({path: 'entity', populate: {path: 'topic', populate: {path: 'color'}}})
        .exec(function (err, events) {
            if (err) console.log(err);

            if (req.baseUrl.match(/api/)) {

                let eventsCalendar = [];

                events.forEach((el)=>{

                    eventsCalendar.push({
                        "id": el._id,
                        "title": el.entity.name + ' (' + el.name + ')',
                        "start": el.timeStart,
                        "end": el.timeEnd,
                        "backgroundColor": el.entity.topic.color.name
                    });
                });

                res.json(eventsCalendar);
            } else {
                res.render('event/eventList', {title: 'Events list', events: events});
            }
        });
};

exports.eventDetail = function (req, res) {

    if (req.baseUrl.match(/api/)) {
        res.send('');
    } else {
        res.render('index', {title: 'Scheduler'});
    }
};

// виводимо форму для створення нового запису
exports.eventAddGet = function (req, res) {

    let user = req.currentUser;
    let entityId = req.params.entityId??0;
    let start = req.query.start??'';
    let end = req.query.end??'';
    let backUrl = req.query.backUrl??'';

    // список всіх сутностей авторизованого юзера
    Entity.find({user: user._id}).populate('topic')
        .exec(function (err, entities) {
            if (err) console.log(err);

            res.render('event/eventAdd', {title: 'Add event', entities: entities, entityId: entityId, start: start, end: end, backUrl: backUrl});
        });
}

// додаємо
exports.eventAdd = function (req, res) {

    let name = req.body.name;
    let timeStart = req.body.date + 'T' + req.body.timeStart;
    let timeEnd = req.body.date + 'T' + req.body.timeEnd;
    let entity = req.body.entity;
    let place = req.body.place;
    let about = req.body.about;
    let backUrl = req.query.backUrl??'';

    let repeatDay = parseInt((req.body.repeatDay == '')?0:req.body.repeatDay, 10);
    let repeatWeek = parseInt((req.body.repeatWeek == '')?0:req.body.repeatWeek, 10);
    let repeatMonth = parseInt((req.body.repeatMonth == '')?0:req.body.repeatMonth, 10);

    // юзер у нас завжди доступний після авторизації
    let user = req.currentUser;

    if (repeatDay != 0) {

        // повторюємо івент на задану кількість днів
        while (repeatDay >= 0) {

            let event = new Event({name: name, user: user._id, timeStart: timeStart, timeEnd: timeEnd, entity: entity, place: place, about: about});

            event.save(function (err) {
                if (err) console.log(err);
            });

            let dateTimeStart = new Date(timeStart);
            let dateTimeEnd = new Date(timeEnd);

            timeStart = dateTimeStart.setDate(dateTimeStart.getDate()+1);
            timeEnd = dateTimeEnd.setDate(dateTimeEnd.getDate()+1);

            repeatDay--;
        }

    } else if (repeatWeek != 0) {

        // повторюємо івент (точно в якийсь день тижня) на задану кількість тижнів
        while (repeatWeek >= 0) {

            let event = new Event({name: name, user: user._id, timeStart: timeStart, timeEnd: timeEnd, entity: entity, place: place, about: about});

            event.save(function (err) {
                if (err) console.log(err);
            });

            let dateTimeStart = new Date(timeStart);
            let dateTimeEnd = new Date(timeEnd);

            timeStart = dateTimeStart.setDate(dateTimeStart.getDate()+7);
            timeEnd = dateTimeEnd.setDate(dateTimeEnd.getDate()+7);

            repeatWeek--;
        }

    } else if (repeatMonth != 0) {

        // повторюємо івент на задану кількість місяців в точну дату
        // тобто, якщо задано івент на 03/12/2020 і повторити 2 місяці, то додасть 03/01/2021 та 03/02/2021
        while (repeatMonth >= 0) {

            let event = new Event({name: name, user: user._id, timeStart: timeStart, timeEnd: timeEnd, entity: entity, place: place, about: about});

            event.save(function (err) {
                if (err) console.log(err);
            });

            let dateTimeStart = new Date(timeStart);
            let dateTimeEnd = new Date(timeEnd);

            timeStart = dateTimeStart.setMonth(dateTimeStart.getMonth()+1);
            timeEnd = dateTimeEnd.setMonth(dateTimeEnd.getMonth()+1);

            repeatMonth--;
        }

    } else {

        let event = new Event({name: name, user: user._id, timeStart: timeStart, timeEnd: timeEnd, entity: entity, place: place, about: about});

        event.save(function (err) {
            if (err) console.log(err);
        });
    }

    if (req.baseUrl.match(/api/)) {
        res.send('');
    } else {
        if (backUrl != '') {
            res.redirect('/'+backUrl);
        } else {
            res.redirect('/');
        }
    }
};

// виводимо форму для редагування
exports.eventEdit = function (req, res) {

    let eventId = req.params.id;
    let backUrl = req.query.backUrl??'';

    Event.findById(eventId).exec(function (err, event) {
        if (err) {
            if (err) console.log(err);
        }

        let user = req.currentUser;

        // список всіх сутностей авторизованого юзера
        Entity.find({user: user._id}).populate('topic')
            .exec(function (err, entities) {
                if (err) console.log(err);

                res.render('event/eventEdit', {title: 'Edit event', event: event, entities: entities, backUrl: backUrl});
            });
    });
};

exports.eventUpdate = function (req, res) {

    let name = req.body.name;
    let timeStart = req.body.date + 'T' + req.body.timeStart;
    let timeEnd = req.body.date + 'T' + req.body.timeEnd;
    let entity = req.body.entity;
    let place = req.body.place;
    let about = req.body.about;
    let backUrl = req.query.backUrl??'';

    var event = new Event({_id: req.params.id, name: name, timeStart: timeStart, timeEnd: timeEnd, entity: entity, place: place, about: about});

    Event.findByIdAndUpdate(req.params.id, event, {}, function (err, event) {
        if (err) console.log(err);

        if (req.baseUrl.match(/api/)) {
            res.send('');
        } else {
            if (backUrl != '') {
                res.redirect('/'+backUrl);
            } else {
                res.redirect('/');
            }
        }
    });
};

exports.eventDelete = function (req, res) {

    var eventId = req.params.id;

    Event.findByIdAndDelete(eventId).exec(function (err, event) {
        if (err) {
            if (err) console.log(err);
        }

        res.json({});
    });
};
