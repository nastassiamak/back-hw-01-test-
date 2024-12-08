export const HTTP_STATUSES = {
    NOT_FOUND_404: 404,
    BAD_REQUEST_400: 400,

    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204
}

export enum Resolutions {
    P144 = "P144",
    P240 = "P240",
    P360 = "P360",
    P480 = "P480",
    P720 = "P720",
    P1080 = "P1080",
    P1440 = "P1440",
    P2160 = "P2160",
}

export type VideoType = {
    id: number;
    title: string;
    author: string;
    canBeDownloaded?: boolean;
    minAgeRestriction?: number | null;
    createdAt: string;
    publicationDate: string;
    availableResolutions: Resolutions[];
}

export type FieldError = {
    message: string;
    field: string;
}

export type APIErrorResult = {
    errorsMessages: FieldError[];
}

export type CreateVideoInputModel = {
    title: string;
    author: string;
    availableResolutions: Resolutions[];
}

export type UpdateVideoInputModel = {
    title: string;
    author: string;
    availableResolutions: Resolutions[];
    canBeDownloaded?: boolean;
    minAgeRestriction?: number | null;
    publicationDate?: string;

}