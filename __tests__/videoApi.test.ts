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

        const createRes = await request(app).post(SETTINGS.PATH.VIDEOS).send(newVideo);
        const videoId = createRes.body.id;

        const updatedVideo = {
            title: null, // Invalid
            author: 'Updated Author',
            availableResolutions: ['INVALID_RESOLUTION'], // Invalid
            canBeDownloaded: 'not-a-boolean', // Invalid
            minAgeRestriction: -1
        };

        const res = await request(app).put(`${SETTINGS.PATH.VIDEOS}/${videoId}`).send(updatedVideo);
        expect(res.status).toBe(400); // Expecting status 400
        expect(res.body.errorsMessages).toHaveLength(4); // Adjust to 3 based on actual errors returned

        // Check specific error messages
        expect(res.body.errorsMessages).toEqual(expect.arrayContaining([
            expect.objectContaining({ field: 'title'}),
            expect.objectContaining({ field: 'availableResolutions' }),
            expect.objectContaining({ field: 'canBeDownloaded'}),

            expect.objectContaining({ field: 'minAgeRestriction' }),
        ]));

        // // Verify the video was NOT updated successfully
        // const getResponse = await request(app).get(`${SETTINGS.PATH.VIDEOS}/${videoId}`);
        // expect(getResponse.status).toBe(HTTP_STATUSES.OK_200); // Expecting status 200 OK
        // expect(getResponse.body.title).toBe(newVideo.title); // Confirm title has not changed
        // expect(getResponse.body.author).toBe(newVideo.author); // Confirm author has not changed
        // expect(getResponse.body.availableResolutions).toEqual(expect.arrayContaining(newVideo.availableResolutions)); // Confirm resolutions unchanged
        // expect(getResponse.body.canBeDownloaded).toBeUndefined(); // Confirm canBeDownloaded has not been defined yet
    });

        // const res = await request(app).put(`${SETTINGS.PATH.VIDEOS}/${videoId}`).send(updatedVideo);
        // expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
        //
        // expect(res.body.errorsMessages[0].field).toBe('title');
        // expect(res.body.errorsMessages[0].message).toContain('Title is required and must be a string with a maximum length of 40.');
        // expect(res.body.errorsMessages[1].field).toBe('availableResolutions');
        // expect(res.body.errorsMessages[0].message).toContain('Invalid resolutions');
        // expect(res.body.errorsMessages[2].field).toBe('canBeDownloaded');
        // expect(res.body.errorsMessages[0].message).toContain('CanBeDownloaded must be a boolean.');
        //
        //
        //
        // // проверяем, что видео не обновилось
        // const getRes = await request(app).get(`${SETTINGS.PATH.VIDEOS}/${videoId}`);
        // expect(getRes.body.title).toBe(newVideo.title);
        // expect(getRes.body.author).toBe(newVideo.author);


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