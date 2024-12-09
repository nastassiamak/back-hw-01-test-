import express from "express";
import {
    createVideo,
    deleteVideo,
    getAllVideos,
    getVideoById,
    updateVideo
} from "./videoController";

export const videosRouter = express.Router()

videosRouter.get('/', getAllVideos)
videosRouter.get('/:id', getVideoById)
videosRouter.post('/', createVideo)
videosRouter.put('/:id', updateVideo)
videosRouter.delete('/:id', deleteVideo)



