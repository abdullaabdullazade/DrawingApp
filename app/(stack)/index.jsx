import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const { height, width } = Dimensions.get('window');

export default function App() {
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [history, setHistory] = useState({ undo: [], redo: [] });
    const viewRef = useRef(null);

    const onTouchEnd = () => {
        if (currentPath.length > 0) {
            setHistory({
                undo: [...history.undo, paths],
                redo: [],
            });
            setPaths([...paths, currentPath]);
            setCurrentPath([]);
        }
    };

    const onTouchMove = (event) => {
        const newPath = [...currentPath];
        const locationX = event.nativeEvent.locationX;
        const locationY = event.nativeEvent.locationY;
        const newPoint = `${newPath.length === 0 ? 'M' : 'L'}${locationX.toFixed(0)},${locationY.toFixed(0)}`;
        newPath.push(newPoint);
        setCurrentPath(newPath);
    };

    const handleClearButtonClick = () => {
        setPaths([]);
        setCurrentPath([]);
        setHistory({ undo: [], redo: [] });
    };

    const handleSaveButtonClick = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permissions not granted',
                    text2: 'You must grant permissions to save the image',
                });
                return;
            }

            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1,
            });

            await MediaLibrary.saveToLibraryAsync(uri);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Image successfully saved to gallery.',
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Image not saved.',
            });
        }
    };

    const handleUndo = () => {
        if (history.undo.length > 0) {
            const lastState = history.undo.pop();
            setHistory({
                undo: history.undo,
                redo: [paths, ...history.redo],
            });
            setPaths(lastState);
            setCurrentPath([]);
        }
    };

    const handleRedo = () => {
        if (history.redo.length > 0) {
            const nextState = history.redo.shift();
            setHistory({
                undo: [...history.undo, paths],
                redo: history.redo,
            });
            setPaths(nextState);
            setCurrentPath([]);
        }
    };

    return (
        <View style={styles.container}>
            <View ref={viewRef} style={styles.svgContainer} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <Svg height={height * 0.7} width={width}>
                    {paths.map((path, index) => (
                        <Path
                            key={`path-${index}`}
                            d={path.join('')}
                            stroke='red'
                            fill='transparent'
                            strokeWidth={3}
                            strokeLinejoin='round'
                            strokeLinecap='round'
                        />
                    ))}
                    <Path
                        d={currentPath.join('')}
                        stroke='red'
                        fill='transparent'
                        strokeWidth={3}
                        strokeLinejoin='round'
                        strokeLinecap='round'
                    />
                </Svg>
            </View>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={handleClearButtonClick}>
                    <Ionicons name="trash-outline" size={24} color="white" />
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleSaveButtonClick}>
                    <Ionicons name="save-outline" size={24} color="white" />
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleUndo}>
                    <Ionicons name="arrow-undo-outline" size={24} color="white" />
                    <Text style={styles.buttonText}>Undo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleRedo}>
                    <Ionicons name="arrow-redo-outline" size={24} color="white" />
                    <Text style={styles.buttonText}>Redo</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.footerText}>By JavaScript(@codejavascript)</Text>
            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    svgContainer: {
        height: height * 0.7,
        width: width * 0.9,
        borderColor: 'black',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: width * 0.9,
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4caf50',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        margin: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    footerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});
