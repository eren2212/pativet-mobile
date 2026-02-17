import { View, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useRef } from "react";


export default function Loading() {

    
    return (
          <View     className="flex-1 items-center justify-center">
                  <LottieView
              autoPlay={true}
              loop
              style={{
                width: 200,
                height: 200, 
              }}
              // Find more Lottie files at https://lottiefiles.com/featured
                source={require('../../../assets/animations/Loading.json')}
        />
        </View>
    );
}