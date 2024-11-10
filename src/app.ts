import express, { Request, Response } from 'express';

export const app = express();
app.use(express.json());

enum Resolutions {
    P144 = "P144",
    P240 = "P240",
    P360 = "P360",
    P480 = "P480",
    P720 = "P720",
    P1080 = "P1080",
    P1440 = "P1440",
    P2160 = "P2160",
}

interface Video {
    id: number;
    title: string;
    author: string;
    canBeDownloaded: boolean;
    minAgeRestriction?: number | null;
    createdAt: string;
    publicationDate: string;
    availableResolutions: Resolutions[];
}

interface FieldError {
    message?: string;
    field?: string;
}

interface APIErrorResult {
    errorsMessages?: FieldError[];
}

interface CreateVideoInputModel {
    title: string;
    author: string;
    availableResolutions: Resolutions[];
}

interface UpdateVideoInputModel {
    title: string;
    author: string;
    availableResolutions: Resolutions[];
    canBeDownloaded?: boolean;
    minAgeRestriction?: number | null;
    publicationDate?: string;
}

let videos: Video[] = [];
let nextId = 1;

// Валидация входных данных при создании видео
function validateCreateVideoInput(input: Record<string, any>): APIErrorResult | null {
    const errors: FieldError[] = [];

    if (!input.title || typeof input.title !== 'string' || input.title.length > 40) {
        errors.push({ message: "Title is required and must be a string with a maximum length of 40.", field: "title" });
    }
    if (!input.author || typeof input.author !== 'string' || input.author.length > 20) {
        errors.push({ message: "Author is required and must be a string with a maximum length of 20.", field: "author" });
    }
    // Проверка доступных разрешений
    if (!Array.isArray(input.availableResolutions) || input.availableResolutions.length === 0) {
        errors.push({ message: "At least one resolution must be provided and it must be an array.", field: "availableResolutions" });
    } else {
        const invalidResolutions = input.availableResolutions.filter((resolution: string) =>
            !Object.values(Resolutions).includes(resolution as Resolutions)
        );
        if (invalidResolutions.length > 0) {
            errors.push({ message: `Invalid resolutions: ${invalidResolutions.join(', ')}`, field: "availableResolutions" });
        }
    }
    return errors.length > 0 ? { errorsMessages: errors } : null;
}

// Получение всех видео
app.get('/videos', (req: Request, res: Response) => {
    res.json(videos);
});

// Получение видео по ID
app.get('/videos/:id', (req: Request, res: Response) => {
    const video = videos.find(v => v.id === Number(req.params.id));
    if (!video) {
        res.status(404).json({ errorsMessages: [{ message: "Video not found", field: "id" }] });
        return;
    }
    res.json(video);
});

// Добавление нового видео
app.post('/videos', (req: Request, res: Response) => {
    const validationError = validateCreateVideoInput(req.body);
    if (validationError) {
        res.status(400).json(validationError);
        return;
    }

    const newVideo: Video = {
        id: nextId++,
        title: req.body.title,
        author: req.body.author,
        canBeDownloaded: req.body.canBeDownloaded || false,
        minAgeRestriction: req.body.minAgeRestriction || null,
        createdAt: new Date().toISOString(),
        publicationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 день
        availableResolutions: req.body.availableResolutions,
    };

    videos.push(newVideo);
    res.status(201).json(newVideo);
});

// Обновление существующего видео
app.put('/videos/:id', (req: Request, res: Response) => {
    const video = videos.find(v => v.id === Number(req.params.id));
    if (!video) {
        res.status(404).json({ errorsMessages: [{ message: "Video not found", field: "id" }] });
        return;
    }

    const updateData: UpdateVideoInputModel = req.body;

    if (updateData.title && (typeof updateData.title !== 'string' || updateData.title.length > 40)) {
        res.status(400).json({ errorsMessages: [{ message: "Title must be a string with a maximum length of 40.", field: "title" }] });
        return;
    }
    if (updateData.author && (typeof updateData.author !== 'string' || updateData.author.length > 20)) {
        res.status(400).json({ errorsMessages: [{ message: "Author must be a string with a maximum length of 20.", field: "author" }] });
        return;
    }
    // Проверка доступных разрешений
    if (updateData.availableResolutions) {
        if (!Array.isArray(updateData.availableResolutions) || updateData.availableResolutions.length === 0) {
            res.status(400).json({ errorsMessages: [{ message: "At least one resolution must be provided and it must be an array.", field: "availableResolutions" }] });
        return;
        }

        const invalidResolutions = updateData.availableResolutions.filter((resolution: string) =>
            !Object.values(Resolutions).includes(resolution as Resolutions)
        );
        if (invalidResolutions.length > 0) {
           res.status(400).json({ errorsMessages: [{ message: `Invalid resolutions: ${invalidResolutions.join(', ')}`, field: "availableResolutions" }] });
        return;
        }

        video.availableResolutions = updateData.availableResolutions;
    }

    // Здесь идет обновление других полей

    if (updateData.title) video.title = updateData.title;
    if (updateData.author) video.author = updateData.author;
    if (updateData.canBeDownloaded !== undefined) video.canBeDownloaded = updateData.canBeDownloaded;
    if (updateData.minAgeRestriction !== undefined) video.minAgeRestriction = updateData.minAgeRestriction;
    if (updateData.publicationDate) video.publicationDate = updateData.publicationDate;


    res.status(204).send();
});

// Удаление видео по ID
app.delete('/videos/:id', (req: Request, res: Response) => {
    const index = videos.findIndex(v => v.id === Number(req.params.id));
    if (index === -1) {
        res.status(404).json({ errorsMessages: [{ message: "Video not found", field: "id" }] });
        return;
    }
    videos.splice(index, 1);
    res.status(204).send();
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});