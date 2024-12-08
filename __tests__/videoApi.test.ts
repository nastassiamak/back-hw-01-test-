import request from 'supertest';

import {db} from "../src/db/db";
import {HTTP_STATUSES} from "../src/models/videoModels";
import {SETTINGS} from "../src/setting";
import app from "../src/app";


describe('Video API', () => {
    beforeEach(async () => {
        await request(app).delete('/__test__/data')
        // Очищаем массив videos перед каждым тестом для предотвращения влияния предыдущих тестов
        // (Если у вас есть способ сбросить состояние вашего API, используйте его тут)
        db.videos = [];


    });

    it('GET /videos - Success', async () => {
        const res = await request(app).get(SETTINGS.PATH.VIDEOS);
        expect(res.status).toBe(HTTP_STATUSES.OK_200);
        expect(res.body).toEqual([]);
    });

    it('POST /videos - Create a new video', async () => {
        const newVideo = {
            title: 'Test Video',
            author: 'Test Author',
            availableResolutions: ['P360', 'P720'],

        };

        const res = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
        expect(res.status).toBe(HTTP_STATUSES.CREATED_201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe(newVideo.title);
        expect(res.body.author).toBe(newVideo.author);
    });

    it('POST /videos - Create video with invalid resolutions', async () => {
        const newVideo = {
            title: 'Test Video',
            author: 'Test Author',
            availableResolutions: ['P360', 'INVALID_RESOLUTION'], // one invalid resolution
        };

        const res = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
        expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
        expect(res.body.errorsMessages[0].field).toBe('availableResolutions');
        expect(res.body.errorsMessages[0].message).toContain('Invalid resolutions');
    });

    it('POST /videos - Create video without availableResolutions', async () => {
        const newVideo = {
            title: 'Test Video',
            author: 'Test Author',
            // availableResolutions is missing
        };

        const res = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
        expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
        expect(res.body.errorsMessages[0].field).toBe('availableResolutions');
        expect(res.body.errorsMessages[0].message).toBe('At least one resolution must be provided and it must be an array.');
    });

    it('POST /videos - Create video with invalid canBeDownloaded', async () => {
        const newVideo = {
            title: 'Test Video',
            author: 'Test Author',
            availableResolutions: ['P360'], // one invalid resolution
            canBeDownloaded: 'true',
        };

        const res = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
        expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
        expect(res.body.errorsMessages[0].field).toBe('canBeDownloaded');
        expect(res.body.errorsMessages[0].message).toContain('CanBeDownloaded must be a boolean.');
    });

    it('GET /videos/:id - Get video by id', async () => {
        const newVideo = {
            title: 'Test Video',
            author: 'Test Author',
            availableResolutions: ['P360'],

        };

        const createRes = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
        const videoId = createRes.body.id;

        const res = await request(app).get(`${SETTINGS.PATH.VIDEOS}/${videoId}`);
        expect(res.status).toBe(HTTP_STATUSES.OK_200);
        expect(res.body.title).toBe(newVideo.title);
        expect(res.body.author).toBe(newVideo.author);
    });

    it('PUT /videos/:id - Update video by id', async () => {
        const newVideo = {
            title: 'Test Video',
            author: 'Test Author',
            availableResolutions: ['P360'],
            canBeDownloaded: false,
            minAgeRestriction: 18
        };

        // Создаем видео
        const createRes = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
        const videoId = createRes.body.id;

        // Данные для обновления
        const updatedVideo = {
            title: 'Updated Video Title',
            author: 'Updated Author',
            availableResolutions: ['P144', 'P360'], // Ожидаем, что оба разрешения будут актуальными
            canBeDownloaded: true,
            minAgeRestriction: 16
        };

        // Выполняем PUT-запрос на обновление видео
        const res = await request(app).put(`${SETTINGS.PATH.VIDEOS}/${videoId}`).send(updatedVideo);
        expect(res.status).toBe(HTTP_STATUSES.NO_CONTENT_204);

        // Проверяем обновленное видео
        const updatedRes = await request(app).get(`${SETTINGS.PATH.VIDEOS}/${videoId}`);
        expect(updatedRes.status).toBe(HTTP_STATUSES.OK_200);

        expect(updatedRes.body).toEqual(expect.objectContaining({
            id: videoId,
            title: updatedVideo.title,
            author: updatedVideo.author,
            availableResolutions: expect.arrayContaining(updatedVideo.availableResolutions), // Проверка на наличие разрешений
            canBeDownloaded: updatedVideo.canBeDownloaded,
            minAgeRestriction: updatedVideo.minAgeRestriction,
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/), // Проверка ISO
            publicationDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/), // Проверка ISO
        }));
    });

    it('PUT /videos/:id - should return error if title is too long and minAgeRestriction is invalid; status 400', async () => {
        const newVideo = {
            title: 'Test Video',
            author: 'Test Author',
            availableResolutions: ['P360'],
            canBeDownloaded: false,
            minAgeRestriction: 18
        };

        // Создание видео для теста
        const createRes = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
        const videoId = createRes.body.id;

        // Неверные данные для обновления
        const invalidUpdateData = {
            title: "length_41-oGuSMzyRUxdnN7ClQA7QbIEk5eMianm", // Слишком длинный заголовок
            author: "valid author",
            availableResolutions: ["P720"],
            canBeDownloaded: true,
            minAgeRestriction: 25 // здесь можно проверить с чем связано ограничение
        };

        // Запрос на PUT
        const res = await request(app).put(`${SETTINGS.PATH.VIDEOS}/${videoId}`).send(invalidUpdateData);
        expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
        expect(res.body.errorsMessages).toEqual(expect.arrayContaining([
            expect.objectContaining({
                field: 'title',
                message: 'Title is required and must be a string with a maximum length of 40.',
            }),
            // также проверьте поле minAgeRestriction, если оно требуется
            expect.objectContaining({
                field: 'minAgeRestriction', // Проверьте, если у вас есть ошибка, возвращающаяся для него
                message: expect.any(String), // Замените expect.any(String) на конкретное сообщение, если это необходимо
            }),
        ]));
    });

    // it('PUT /videos/:id - should return error if passed body is incorrect; status 400', async () => {
    //     const newVideo = {
    //         title: 'Test Video',
    //         author: 'Test Author',
    //         availableResolutions: ['P360'],
    //         canBeDownloaded: false,
    //         minAgeRestriction: 18
    //     };
    //
    //     // Сначала создаем видео, чтобы получить его ID для обновления
    //     const createRes = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
    //     const videoId = createRes.body.id;
    //
    //     // Теперь попытаемся обновить видео с некорректными данными
    //     const invalidUpdateData = {
    //         title: '', // Неверный, пустой заголовок
    //         author: 'Updated Author',
    //         availableResolutions: [] // Неверный: разрешения должны быть массивом с хотя бы одним элементом
    //     };
    //
    //     const res = await request(app).put(`${SETTINGS.PATH.VIDEOS}/${videoId}`).send(invalidUpdateData);
    //     expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
    //     expect(res.body.errorsMessages).toEqual(expect.arrayContaining([
    //         expect.objectContaining({
    //             field: 'title',
    //             message: 'Title is required and must be a string with a maximum length of 40.',
    //         }),
    //         expect.objectContaining({
    //             field: 'availableResolutions',
    //             message: 'At least one resolution must be provided and it must be an array.',
    //         }),
    //     ]));
    // });

    it('DELETE /videos/:id - Delete video by id', async () => {
        const newVideo = {
            title: 'Test Video',
            author: 'Test Author',
            availableResolutions: ['P360'],

        };

        const createRes = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
        const videoId = createRes.body.id;

        const res = await request(app).delete(`${SETTINGS.PATH.VIDEOS}/${videoId}`);
        expect(res.status).toBe(HTTP_STATUSES.NO_CONTENT_204);

        // Проверяем, что видео было удалено
        const checkRes = await request(app).get(`${SETTINGS.PATH.VIDEOS}/${videoId}`);
        expect(checkRes.status).toBe(HTTP_STATUSES.NOT_FOUND_404);
    });
});