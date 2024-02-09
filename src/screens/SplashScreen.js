import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native'
import React, { useEffect } from 'react'

import * as Progress from 'react-native-progress';
import { theme } from '../theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { setWeather } from '../../store/weatherSlice';
import { getData, storeData } from '../utils/asyncStorage'
import { fetchWeatherForcast } from '../api/weather'

export default function SplashScreen({navigation}) {

    const weather = useSelector(state => state.weather.value);
    const dispatch = useDispatch();

    useEffect(() => {
        loadWeatherData();
    }, []);

    const loadWeatherData = async () => {
        let myCity = await getData('city');
        let cityName = "Nuuk";
        if(myCity) cityName = myCity;
        fetchWeatherForcast({cityName: cityName, days: '3'}).then(data=>{
            dispatch(setWeather(data));
            navigation.navigate('Home');
        })
      }

  return (
    <View className="flex-1 relative">
      <View style={{...StyleSheet.absoluteFillObject,backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <Image blurRadius={5} source={require('../../assets/images/bg.jpg')} className="absolute b-full w-full object-cover"/>
      </View>
      <SafeAreaView className="flex flex-1">
        <View className="flex-1 flex justify-center items-center space-y-10">
            <Image source={require('../../assets/images/appicon.png')} className="w-36 h-36 object-cover"/>
            <Text className="text-white text-2xl font-bold">Weather</Text>
            <Progress.CircleSnail thickness={10} size={80} color={theme.bgWhite(0.5)}/>
          </View>
      </SafeAreaView>
    </View>
  )
}