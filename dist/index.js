"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const moment_1 = __importDefault(require("moment"));
const _ = __importStar(require("lodash"));
const fetch = require('node-fetch');
moment_1.default.locale('de');
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.use(cors_1.default());
app.use('/', express_1.default.static('public'));
app.get('/milestones/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
    var activeYear = parseInt(req.params.id);
    const timelineData = yield getTimelineData();
    const milestones = yield getMilestones(activeYear, timelineData);
    res.json(milestones);
}));
const getTimelineData = () => __awaiter(this, void 0, void 0, function* () {
    const timelineRequest = yield fetch('http://localhost:8000/stats/person_birth_death_pic', {
        method: 'GET',
    });
    const data = yield timelineRequest.json();
    const name = _.values(data.name);
    const birthday = _.values(data.date_of_birth);
    const deathday = _.values(data.date_of_birth);
    const img = _.values(data.link);
    const date = moment_1.default(moment_1.default(birthday[0]).format('YYYY MMM DD')).format('YYYY,M,D');
    const milestones = name.map((n, i) => {
        return {
            birthday: birthday[i],
            deathday: deathday[i],
            name: n,
            img: img[i],
        };
    });
    return milestones;
});
const getMilestones = (activeYear, milestones) => {
    const currentMilestones = milestones.map((e, i) => {
        //console.log(e.birthday)
        if (e.birthday && e.birthday.trim() !== '') {
            var reg1 = new RegExp('[1-9][0-9][0-9][0-9]$');
            var reg2 = new RegExp('[1-9][0-9][0-9][0-9]~$');
            var reg3 = new RegExp(/([1-9][0-9][0-9][0-9]\s[A-Z][a-z][a-z]\s([0][1-9]|[1-3][0-9]))$/);
            const varInit = (date) => {
                if (date.match(reg1)) {
                    return moment_1.default(moment_1.default(date).format('YYYY')).format('YYYY,M,D');
                }
                else if (date.match(reg2)) {
                    return moment_1.default(moment_1.default(date.replace('~', '')).format('YYYY')).format('YYYY,M,D');
                }
                else if (date.match(reg3)) {
                    return moment_1.default(moment_1.default(date, 'YYYY MMM DD').format('YYYY MMM DD'), 'YYYY MMM DD').format('YYYY,M,D');
                }
            };
            const birthday = varInit(e.birthday);
            const deathday = varInit(e.birthday);
            const response = [];
            if (parseInt(moment_1.default(birthday).format('YYYY')) <=
                parseInt(activeYear + 50) &&
                parseInt(moment_1.default(birthday).format('YYYY')) >=
                    parseInt(activeYear)) {
                response.push({
                    startDate: birthday,
                    headline: `* ${e.name}`,
                    text: `${e.name} wird geboren`,
                    asset: {
                        media: e.img,
                        credit: '',
                        caption: '',
                    },
                });
            }
            if (parseInt(moment_1.default(deathday).format('YYYY')) <=
                parseInt(activeYear + 50) &&
                parseInt(moment_1.default(deathday).format('YYYY')) >=
                    parseInt(activeYear)) {
                response.push({
                    startDate: deathday,
                    headline: `† ${e.name}`,
                    text: `${e.name} verstirbt`,
                    asset: {
                        media: e.img,
                        credit: '',
                        caption: '',
                    },
                });
            }
            //console.log('response', response)
            return response;
        }
    });
    const source = {
        timeline: {
            headline: 'Die Geschichte beginnt ...',
            text: 'Meilensteine um 1200',
            startdate: '1220',
            type: 'default',
            date: _.spread(_.union)(currentMilestones),
        },
    };
    return source;
};
const server = app.listen(5000, () => {
    console.log('server is running');
});
exports.default = server;
//# sourceMappingURL=index.js.map