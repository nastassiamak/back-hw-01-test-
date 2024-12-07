import { Request, Response } from 'express';
import {
    APIErrorResult,
    CreateVideoInputModel,
    HTTP_STATUSES,
    Resolutions,
    UpdateVideoInputModel,
    VideoType
} from "./videoModels";

import {validateCreateVideoInput} from "../utils/videoValidation";
import {db, getNextId} from "../db/db";

export const getAllVideos = (red: Request, res: Response<VideoType[]>) => {
    res.json(db.videos);
};

export const getVideoById = (req: Request<{ id: string }>, res: Response<VideoType | APIErrorResult>) => {
    const video = db.videos.find(v => v.id === Number(req.params.id));
    if (!video) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).json({ errorsMessages: [{ message: "Video not found", field: "id" }] });
        return;
    }
    res.json(video);
};

export const createVideo = (req: Request<CreateVideoInputModel>, res: Response<VideoType | APIErrorResult>) => {
    const validationError = validateCreateVideoInput(req.body);
    if (validationError) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json(validationError);
        return;
    }

    const newVideo: VideoType = {
        id: getNextId(),
        title: req.body.title,
        author: req.body.author,
        canBeDownloaded: req.body.canBeDownloaded || false,
        minAgeRestriction: req.body.minAgeRestriction || null,
        createdAt: new Date().toISOString(),
        publicationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 день
        availableResolutions: req.body.availableResolutions,
    };

    db.videos.push(newVideo);
    res.status(HTTP_STATUSES.CREATED_201).json(newVideo);
};


// Функция обновления видео
export const updateVideo = (req: Request<{ id: string }, {}, UpdateVideoInputModel>,
                            res: Response<APIErrorResult | null>) => {

    const video = db.videos.find(v => v.id === Number(req.params.id));
    if (!video) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).json({ errorsMessages: [{ message: "Video not found", field: "id" }] });
        return;
    }

    const updateData: UpdateVideoInputModel = req.body;
    const validationError = validateCreateVideoInput(updateData);
    if (validationError) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json(validationError);
        return;
    }

    // Здесь идет обновление других полей

    if (updateData.title) video.title = updateData.title;
    if (updateData.author) video.author = updateData.author;
    if (updateData.canBeDownloaded !== undefined) video.canBeDownloaded = updateData.canBeDownloaded;
    if (updateData.minAgeRestriction !== undefined) video.minAgeRestriction = updateData.minAgeRestriction;
    if (updateData.publicationDate) video.publicationDate = updateData.publicationDate;


    res.status(HTTP_STATUSES.NO_CONTENT_204).send();
};

// Функция удаления видео
export const deleteVideo = (req: Request<{ id: string }>, res: Response) => {
    const index = db.videos.findIndex(v => v.id === Number(req.params.id));
    if (index === -1) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).json({ errorsMessages: [{ message: "Video not found", field: "id" }] });
        return;
    }
    db.videos.splice(index, 1);
    res.status(HTTP_STATUSES.NO_CONTENT_204).send();
};