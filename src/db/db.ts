import {VideoType} from "./videoModels";

export const db: DBType = {
    videos:[]
}
export type DBType = {
    videos: VideoType[],


}
let nextId = 1; // Локальная переменная

export function getNextId() {
    return nextId++; // Возвращаем текущее значение nextId и инкрементируем его
}