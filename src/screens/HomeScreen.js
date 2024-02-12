import { View, Text, Image, SafeAreaView, TextInput, TouchableOpacity, ScrollView, StatusBar, Platform, Dimensions, StyleSheet, LogBox } from 'react-native'
import * as NavigationBar from "expo-navigation-bar";
import { useSelector } from 'react-redux';
import { Video } from "expo-av";
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { theme } from '../theme/theme'

import {CalendarDaysIcon, ClockIcon, MagnifyingGlassIcon, ChevronRightIcon, MapPinIcon} from 'react-native-heroicons/outline'
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForcast } from '../api/weather'
import { getWeatherIcon, getWeatherVideo } from '../constants'
import * as Progress from 'react-native-progress';
import * as Location from 'expo-location';
import { getData, storeData } from '../utils/asyncStorage'

if (Platform.OS == 'android') {
  LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
  LogBox.ignoreAllLogs();
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync("#ffffff01");
}

const WINDOW_HEIGHT = Dimensions.get('window').height;

export default function HomeScreen() {

  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [isHourlyForecast, setIsHourlyForecast] = useState(true);

  const weatherData = useSelector(state => state.weather.value);

  
  const handleLocation = (loc) => {
    setLocations([]);
    setShowSearch(false);
    setLoading(true);
    fetchWeatherForcast({cityName: loc.name, days: '3'}).then(data=>{
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
    })
  } 
  
  const handleSearch = value=>{
    if (value.length>2) {
      fetchLocations({cityName: value}).then(data => {
        setLocations(data);
      });
    }
  }

  useEffect(() => {
    if (!weather) {
      loadWeatherData();
    }
    else{
      setWeather(weatherData);
      setLoading(false);
    }
  },[])

  const loadWeatherFromCurrentLocation = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permisstion not granted');
      setLoading(false);
    }
    else{
      let curLocation = await Location.getCurrentPositionAsync({});
      let longLat = curLocation.coords.latitude +"," + curLocation.coords.longitude;
      console.log(longLat)
      fetchWeatherForcast({cityName: longLat, days: '3'}).then(data=>{
        setWeather(data);
        storeData('city', data.location.name);
        setLoading(false);
      })
    }
  }

  const loadWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = "Nuuk";
    if(myCity) cityName = myCity;
    fetchWeatherForcast({cityName: cityName, days: '3'}).then(data=>{
      setWeather(data);
      setLoading(false);
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200),[]);

  const tConvert = (dateTime) => {
    date = new Date(dateTime);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  const dConvert = (dateTime) => {
    date = new Date(dateTime);
    var options = {weekday: 'long'}
    var dayName = date.toLocaleDateString('en-US', options);
    return dayName.split(',')[0];
  }

  const {current, location} = weather;

  return (
    <View className="flex-1 relative">
      <Image blurRadius={20} source={require('../../assets/images/clouds.jpg')} className="absolute b-full w-full"/>
      <View style={{...StyleSheet.absoluteFillObject,backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <Video
            isLooping
            isMuted
            positionMillis={500}
            onLoad={() => {
            }}
            resizeMode="cover"
            shouldPlay
            source={current ? current.is_day == 1 ? getWeatherVideo(current.condition.text, true) : getWeatherVideo(current.condition.text, false) : getWeatherVideo('Sunny', true)}
            style={{ flex: 1 }}
          />
          <BlurView intensity={50} tint={'systemUltraThinMaterialDark'} style={StyleSheet.absoluteFill} />
      </View>
      { (current && weather) && !loading ?
      (<SafeAreaView className="flex flex-1" style={Platform.OS == 'android' ? {marginTop: StatusBar.currentHeight || 0, marginBottom: 30} : ""}>
        {/* SearchBar  */}
        <View style={{height: '7%'}} className="mx-4 relative z-50">
            <View className="flex-row justify-end items-center rounded-full" style={{backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent'}}>
                {
                  showSearch ? (
                  <TextInput onChangeText={handleTextDebounce} placeholder='Search city' placeholderTextColor={'lightgray'} className="pl-6 h-10 flex-1 text-base text-white"/>
                  ): <TouchableOpacity onPress={loadWeatherFromCurrentLocation} style={{backgroundColor: theme.bgWhite(0.4)}} className='rounded-full p-3 m-1'>
                      <MapPinIcon size="25" color="white"/>
                    </TouchableOpacity>
                }
                <TouchableOpacity onPress={() => setShowSearch((prevState) => !prevState)} style={{backgroundColor: theme.bgWhite(0.4)}} className='rounded-full p-3 m-1'>
                    <MagnifyingGlassIcon size="25" color="white"/>
                </TouchableOpacity>
            </View>
            {
              locations.length > 0 && showSearch ? (
                  <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                    {
                      locations.map((loc, index) => {
                        let showBorder = index+1 != locations.length;
                        let borderClass = showBorder? 'border-b-2  border-b-gray-400' : '';
                        return(
                          <TouchableOpacity onPress={() => handleLocation(loc)} key={index} className={`flex-row items-center border-0 p-3 px-5 mb-1 ${borderClass}`}>
                            <MapPinIcon size="20" color="gray"/>
                            <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
                          </TouchableOpacity>
                          )
                      })
                    }
                  </View>
                ) : null
            }
        </View>
        {/* Forcast */}
        <View className="mx-4 flex justify-around flex-1 mb-2">
            {/* location  */}
            <Text className="text-white text-center text-2xl font-bold">
              {location.name},
              <Text className="text-lg font-semibold text-gray-200">
                {" "+location.country}
              </Text>
            </Text>
            {/* Icon */}
            <View className="flex-row justify-center">
              <Image source={current.is_day == 1 ? getWeatherIcon(current.condition.text, true) : getWeatherIcon(current.condition.text, false)} className="w-52 h-52"/>
            </View>
            {/* Temperature */}
            <View className="space-y-2">
              <Text className="text-center font-bold text-white text-7xl ml-5">
                {current.temp_c}&#176;
              </Text>
              <Text className="text-center text-white text-xl tracking-widest">
                {current.condition.text}
              </Text>
            </View>
            {/* Other Stats */}
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../../assets/icons/wind.png')} className="h-6 w-6"/>
                <Text className="text-white font-semibold text-base">
                  {current.wind_kph}km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../../assets/icons/drop.png')} className="h-6 w-6"/>
                <Text className="text-white font-semibold text-base">
                  {current.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../../assets/icons/sun.png')} className="h-6 w-6"/>
                <Text className="text-white font-semibold text-base">
                  {weather.forecast.forecastday[0].astro.sunrise}
                </Text>
              </View>
            </View>
        </View>
        {/* Forcast for next hours*/}
        <View className="mb-2 space-y-3">
            <View className="flex-row mx-5 justify-between">
              <View className="flex-row items-center space-x-2">
                {isHourlyForecast ? <ClockIcon size="22" color="white"/> : <CalendarDaysIcon size='22' color='white'/>}
                <Text className="text-white text-base">{isHourlyForecast ? 'Hourly Forecast' : 'Daily Forecast'}</Text>
              </View>
              <TouchableOpacity className="flex-row items-center space-x-2" onPress={() => {setIsHourlyForecast((prevState) => !prevState)}}>
                <Text className="text-white text-base">{!isHourlyForecast ? 'Hourly Forecast' : 'Daily Forecast'}</Text>
                <ChevronRightIcon size="22" color="white"/>
              </TouchableOpacity>
            </View>
            {isHourlyForecast ? <ScrollView horizontal contentContainerStyle={{paddingHorizontal: 15}} showsHorizontalScrollIndicator={false}>
              {
                weather?.forecast?.forecastday[0]?.hour.map((item, index) => {  
                  return(
                    <View className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4" style={{backgroundColor: theme.bgWhite(0.15)}} key={index}>
                      <Image source={item.is_day == 1 ? getWeatherIcon(item.condition.text, true) : getWeatherIcon(item.condition.text, false)} className="h-11 w-11"/>
                      <Text className="text-white">{tConvert(item.time)}</Text>
                      <Text className="text-white text-xl font-semibold">{item.temp_c}&#176;</Text>
                    </View>
                    )
                })
              }
            </ScrollView>
            :<ScrollView horizontal contentContainerStyle={{paddingHorizontal: 15}} showsHorizontalScrollIndicator={false}>
            {
              weather?.forecast?.forecastday.map((item, index) => {  
                return(
                  <View className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4" style={{backgroundColor: theme.bgWhite(0.15)}} key={index}>
                    <Image source={getWeatherIcon(item.day.condition.text, true)} className="h-11 w-11"/>
                    <Text className="text-white">{dConvert(item.date)}</Text>
                    <Text className="text-white text-xl font-semibold">{item.day.avgtemp_c}&#176;</Text>
                  </View>
                  )
              })
            }
          </ScrollView>
          }
        </View>
      </SafeAreaView>) : 
      (
          <View className="flex-1 flex-row justify-center items-center">
            <Progress.CircleSnail thickness={10} size={140} color={theme.bgWhite(0.5)}/>
          </View>
      )
      }
    </View>
  )
}