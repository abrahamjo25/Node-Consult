import Cookies from 'js-cookie';

export const setCookie = (key, value, options = {}) => {
    Cookies.set(key, value, options);
};

export const getCookie = (key) => {
    return Cookies.get(key);
};

export const removeCookie = (key) => {
    Cookies.remove(key);
};
