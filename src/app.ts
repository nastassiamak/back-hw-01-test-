import express from 'express';
import {SETTINGS} from "./setting";
import {videosRouter} from "./models/videoRouter";

//создание(не запуск) back
const app = express() // создать приложение

app.use(express.json()) // создание свойств-объектов body и query во всех реквестах


app.get('/', (req, res) => {
    // эндпоинт, который будет показывать на верселе какая версия бэкэнда сейчас залита
    res.status(200).json({version: '1.0'})
})
app.use(SETTINGS.PATH.VIDEOS, videosRouter)

// экспортируем приложение по умолчанию
export default app;
