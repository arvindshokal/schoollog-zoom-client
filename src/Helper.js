import BASE_URL_LMS from "./BaseUrl";

export const GET_ZOOM_USER_CREDENTIALS = BASE_URL_LMS + 'learning/user/zoom'

export function setLocalKeyValue(key, value) {
    window.localStorage.setItem(key, value)
}

export function removeLocalKeyValue(key) {
    window.localStorage.removeItem(key)
}

export function getLocalKeyValue(key, defaultValue) {
    return window.localStorage.getItem(key) || defaultValue
}
