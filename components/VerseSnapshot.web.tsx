import React from 'react';
import { View } from 'react-native';

export const VerseSnapshot = React.forwardRef((props: any, ref: any) => (
    <View ref={ref} {...props} />
));

export const captureRef = async () => {
    console.warn("Sharing not supported on web");
    return "";
};
