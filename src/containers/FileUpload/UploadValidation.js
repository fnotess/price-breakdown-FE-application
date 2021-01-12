/**
 * Validate file content type
 * */
import {SUPPORTED_FILE_TYPES} from "../../constants/Constants";

export const isValidContentType = (contentType) => {
    return !(contentType === undefined || !SUPPORTED_FILE_TYPES.includes(contentType));

}