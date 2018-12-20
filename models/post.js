const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    aine: {type: String, required: true},
    opetaja: {type: String, required: false},
    tyyp: {type: String, required: true},
    pealkiri: {type: String, required: true},
    kirjeldus: {type: String, required: true},
    tahtaeg: {type: Date, required: true},
    prioriteet: {type: Number, required: true},
    meeldetuletus: {type: Boolean, default: false, required: false},
    tehtud: {type: Boolean, default: false, required: false},
    slug: {type: String, required: true},
    loodud: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Post', postSchema);