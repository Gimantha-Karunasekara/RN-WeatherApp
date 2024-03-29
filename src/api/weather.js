import axios from "axios";
import { apiKey } from "../constants";

const forcastEndpoint = ({cityName, days}) => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=${days}&aqi=no&alerts=no`;
const locationsEndpoint = ({cityName}) => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${cityName}`;

const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint
    }

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.log('Error: ', error)
        return {};
    }
}

export const fetchWeatherForcast = (params) => {
    let forcastUrl = forcastEndpoint(params);
    return apiCall(forcastUrl);
}

export const fetchLocations = (params) => {
    let locationsUrl = locationsEndpoint(params);
    return apiCall(locationsUrl);
}