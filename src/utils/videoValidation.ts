import {APIErrorResult, FieldError, Resolutions, UpdateVideoInputModel} from "../models/videoModels";
export function validateCreateVideoInput(input: UpdateVideoInputModel): APIErrorResult | null {
    const errors: FieldError[] = [];

    // Проверка title
    if (!input.title || typeof input.title !== 'string' || input.title.length > 40) {
        errors.push({ message: "Title is required and must be a string with a maximum length of 40.", field: "title" });
    }

    // Проверка author
    if (input.author !== undefined && (typeof input.author !== 'string' || input.author.length > 20)) {
        errors.push({ message: "Author is required and must be a string with a maximum length of 20.", field: "author" });
    }

    // Проверка availableResolutions
    if (!Array.isArray(input.availableResolutions) || input.availableResolutions.length === 0) {
        errors.push({ message: "At least one resolution must be provided and it must be an array.", field: "availableResolutions" });
    } else {
        // Проверка разрешений
        const invalidResolutions = input.availableResolutions.filter(resolution =>
            !Object.values(Resolutions).includes(resolution as Resolutions)
        );
        if (invalidResolutions.length > 0) {
            errors.push({ message: `Invalid resolutions: ${invalidResolutions.join(', ')}`, field: "availableResolutions" });
        }
    }

    // Проверка canBeDownloaded
    if (input.canBeDownloaded !== undefined && typeof input.canBeDownloaded !== 'boolean') {
        errors.push({ message: "CanBeDownloaded must be a boolean.", field: "canBeDownloaded" });
    }

    if (input.minAgeRestriction !== undefined) {
        if (typeof input.minAgeRestriction !== 'number' || !Number.isInteger(input.minAgeRestriction)) {
            errors.push({ message: "minAgeRestriction must be an integer.", field: "minAgeRestriction" });
        } else if (input.minAgeRestriction < 0 || input.minAgeRestriction > 18) { // hypothetic maximum age
            errors.push({ message: "minAgeRestriction must be a non-negative integer and must follow any custom limits.", field: "minAgeRestriction" });
        }
    }

    return errors.length > 0 ? { errorsMessages: errors } : null;
}