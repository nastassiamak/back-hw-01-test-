import express, {Request, Response} from 'express';
import {SETTINGS} from "./setting";
import {videosRouter} from "./models/videoRouter";
import {HTTP_STATUSES} from "./models/videoModels";
import {db} from "./db/db";


//создание(не запуск) back
const app = express() // создать приложение

app.use(express.json()) // создание свойств-объектов body и query во всех реквестах


app.get('/', (req, res) => {
    // эндпоинт, который будет показывать на верселе какая версия бэкэнда сейчас залита
    res.status(200).json({version: '1.0'})
})
app.use(SETTINGS.PATH.VIDEOS, videosRouter)


//Дефолтное состояние БД
app.delete('/testing/all-data', (req, res) => {
    db.videos = [];
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
});

// экспортируем приложение по умолчанию
export default app;
