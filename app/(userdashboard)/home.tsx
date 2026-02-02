import { View, Text } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const home = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold text-center">Welcome to user dashboard home</Text>
      <Text className="text-blue-500 px-4 py-2 bg-blue-100 rounded-lg" onPress={() => router.push('/login')}>
        login
      </Text>
    </View>
  )
}

export default home