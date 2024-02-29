import { getCookie } from '../../../(main)/helper/storage';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = process.env.NEXT_PUBLIC_AUTH_URL;
const data = getCookie('data');
const parsedData = data ? JSON.parse(data) : null;
const idToken = parsedData?.idToken;

const accessToken = getCookie('accessToken');

export const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-control-Allow-Origin': '*',
        idToken: idToken,
        accessToken: accessToken,
        clientClaim: '',
        serviceKey: '86rIsmabiYR0OuW1B6NHovQsmWB8'
    }
});
export const userInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-control-Allow-Origin': '*',
        idToken: idToken,
        accessToken: accessToken,
        clientClaim: ''
        // serviceKey: '86rIsmabiYR0OuW1B6NHovQsmWB8'
    }
});
export const GET = async (url, claim) => {
    return await axiosInstance
        .get(url, {
            headers: {
                clientClaim: claim
            }
        })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            if (error.response) {
                toast.error(`Error: ${error?.response?.data?.errors[0]}`);
            } else if (error.request) {
                toast.error('Error: No response received from the server');
            } else {
                toast.error('Error: ' + error.message);
            }
        });
};

// Post request
export const POST = async (data, url, claim) => {
    return await axiosInstance
        .post(url, data)
        .then((response) => {
            toast.success('Created successfully');
            return true;
        })
        .catch((error) => {
            if (error.response) {
                toast.error(`Error: ${error?.response?.data?.errors[0]}`);
            } else if (error.request) {
                toast.error('Error: No response received from the server');
            } else {
                toast.error('Error: ' + error.message);
            }
            return false;
        });
};

// Put request
export const PUT = async (data, url, claim) => {
    return await axiosInstance
        .put(url, data)
        .then((response) => {
            toast.success('Updated successfully');
            return true;
        })
        .catch((error) => {
            if (error.response) {
                toast.error(`Error: ${error?.response?.data?.errors[0]}`);
            } else if (error.request) {
                toast.error('Error: No response received from the server');
            } else {
                toast.error('Error: ' + error.message);
            }
            return false;
        });
};
// Patch request
export const PATCH = async (data, url, claim) => {
    return await axiosInstance
        .patch(url, data)
        .then((response) => {
            toast.success('Updated successfully');
            return true;
        })
        .catch((error) => {
            console.log(error);
            if (error.response) {
                toast.error(`Error: ${error?.response?.data?.errors[0]}`);
            } else if (error.request) {
                toast.error('Error: No response received from the server');
            } else {
                toast.error('Error: ' + error.message);
            }
            return false;
        });
};

// Delete request
export const DELETE = async (url, claim) => {
    return await axiosInstance
        .delete(url)
        .then((response) => {
            toast.success('Deleted successfully');
            return true;
        })
        .catch((error) => {
            if (error.response) {
                toast.error(`Error: ${error?.response?.data?.errors[0]}`);
            } else if (error.request) {
                toast.error('Error: No response received from the server');
            } else {
                toast.error('Error: ' + error.message);
            }
            return false;
        });
};
// change password
export const ChangePassword = async (data, url, claim) => {
    return await userInstance
        .post(url, data)
        .then((response) => {
            toast.success('Updated successfully');
            return true;
        })
        .catch((error) => {
            if (error.response) {
                toast.error(`Error: ${error?.response?.data?.errors[0]}`);
            } else if (error.request) {
                toast.error('Error: No response received from the server');
            } else {
                toast.error('Error: ' + error.message);
            }
            return false;
        });
};
export const ForgotePassword = async (url, claim) => {
    return await userInstance
        .get(url)
        .then(() => {
            return true;
        })
        .catch((error) => {
            if (error.response) {
                toast.error(`Error: ${error?.response?.data?.errors[0]}`);
            } else if (error.request) {
                toast.error('Error: No response received from the server');
            } else {
                toast.error('Error: ' + error.message);
            }
            return false;
        });
};
export async function ResetPassword(data, url, claim) {
    return await userInstance
        .post(url, data)
        .then((response) => {
            toast.success('Updated successfully');
            return true;
        })
        .catch((error) => {
            if (error.response) {
                toast.error(`Error: ${error?.response?.data?.errors[0]}`);
            } else if (error.request) {
                toast.error('Error: No response received from the server');
            } else {
                toast.error('Error: ' + error.message);
            }
            return false;
        });
}
