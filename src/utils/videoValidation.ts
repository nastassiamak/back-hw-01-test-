// Валидация входных данных при создании видео
import {APIErrorResult, FieldError, Resolutions} from "../models/videoModels";

export function validateCreateVideoInput(input: Record<string, any>): APIErrorResult | null {
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
    // Проверка canBeDownloaded
    if (typeof input.canBeDownloaded !== 'boolean') {
        errors.push({ message: "CanBeDownloaded must be a boolean.", field: "canBeDownloaded" });
    }
    return errors.length > 0 ? { errorsMessages: errors } : null;
}