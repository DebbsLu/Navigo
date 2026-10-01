// src/components/ModalGrabarAudio.tsx

import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import BtnClose from './BtnClose';

interface ModalGrabarAudioProps {
  visible: boolean;

  onClose: () => void;

  onSave: (uri: string) => void;
}

type RecordingStatus =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'recorded';

const ModalGrabarAudio: React.FC<
  ModalGrabarAudioProps
> = ({
  visible,
  onClose,
  onSave,
}) => {

  const audioRecorder =
    useAudioRecorder(
      RecordingPresets.HIGH_QUALITY
    );

  const recorderState =
    useAudioRecorderState(
      audioRecorder
    );

  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>('idle');


  // ============================================================
  // PREPARAR PERMISOS Y AUDIO
  // ============================================================

  useEffect(() => {

    if (!visible) {
      return;
    }

    const prepareAudio = async () => {

      try {

        const permission =
          await AudioModule.requestRecordingPermissionsAsync();

        if (!permission.granted) {

          Alert.alert(
            'Permiso necesario',
            'Necesitamos acceso al micrófono para grabar el audio.'
          );

          onClose();

          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });

      } catch (error) {

        console.error(
          'Error preparando audio:',
          error
        );

        Alert.alert(
          'Error',
          'No se pudo preparar el micrófono.'
        );

        onClose();
      }
    };

    prepareAudio();

  }, [visible]);


  // ============================================================
  // INICIAR GRABACIÓN
  // ============================================================

  const handleStartRecording = async () => {

    try {

      await audioRecorder.prepareToRecordAsync();

      audioRecorder.record();

      setRecordingStatus('recording');

    } catch (error) {

      console.error(
        'Error iniciando grabación:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo iniciar la grabación.'
      );
    }
  };


  // ============================================================
  // PAUSAR
  // ============================================================

  const handlePauseRecording = () => {

    try {

      audioRecorder.pause();

      setRecordingStatus('paused');

    } catch (error) {

      console.error(
        'Error pausando grabación:',
        error
      );
    }
  };


  // ============================================================
  // CONTINUAR
  // ============================================================

  const handleResumeRecording = () => {

    try {

      audioRecorder.record();

      setRecordingStatus('recording');

    } catch (error) {

      console.error(
        'Error continuando grabación:',
        error
      );
    }
  };


  // ============================================================
  // ELIMINAR GRABACIÓN
  // ============================================================

  const handleDeleteRecording = async () => {

    try {

      /*
       * IMPORTANTE:
       *
       * stop() es necesario para detener realmente
       * la grabación.
       *
       * Simplemente cambiar un estado de React NO
       * detiene el grabador de expo-audio.
       */

      if (
        recorderState.isRecording ||
        recordingStatus === 'paused' ||
        recordingStatus === 'recorded'
      ) {

        await audioRecorder.stop();

      }

      /*
       * Regresamos completamente al estado inicial.
       */

      setRecordingStatus('idle');

    } catch (error) {

      console.error(
        'Error eliminando grabación:',
        error
      );

      /*
       * Aunque haya ocurrido un error al detener,
       * limpiamos el estado visual para que el usuario
       * pueda volver a grabar.
       */

      setRecordingStatus('idle');
    }
  };


  // ============================================================
  // GUARDAR
  // ============================================================

  const handleSave = async () => {

    try {

      /*
       * Primero detenemos la grabación.
       *
       * Esto es importante porque el URI final puede
       * estar disponible correctamente después de stop().
       */

      if (
        recorderState.isRecording ||
        recordingStatus === 'paused'
      ) {

        await audioRecorder.stop();

      }

      /*
       * Ahora obtenemos el URI.
       */

      const uri = audioRecorder.uri;

      if (!uri) {

        Alert.alert(
          'No se pudo guardar',
          'No se encontró el archivo de audio.'
        );

        return;
      }

      console.log(
        'Audio guardado en URI:',
        uri
      );

      /*
       * Enviamos el URI a InfinityCanvas.
       */

      onSave(uri);

      /*
       * Limpiamos el estado interno.
       */

      setRecordingStatus('idle');

    } catch (error) {

      console.error(
        'Error guardando audio:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo guardar el audio.'
      );
    }
  };


  // ============================================================
  // CERRAR
  // ============================================================

  const handleClose = async () => {

    try {

      /*
       * Si el usuario cierra el modal mientras está
       * grabando, detenemos la grabación.
       *
       * NO guardamos el audio.
       */

      if (
        recorderState.isRecording ||
        recordingStatus === 'paused'
      ) {

        await audioRecorder.stop();

      }

    } catch (error) {

      console.error(
        'Error cerrando grabación:',
        error
      );

    } finally {

      setRecordingStatus('idle');

      onClose();
    }
  };


  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >

      <View style={styles.overlay}>

        <View style={styles.container}>

            <BtnClose
                onPress={onClose}
                absolute
                top={12}
                right={12}
                color="#808088"
                size={18}
            />

          <Text style={styles.title}>
            Grabar audio
          </Text>


          {/* ==================================================
              ESTADO INICIAL
          ================================================== */}

          {recordingStatus === 'idle' && (
            <View style={styles.controls}>

              <TouchableOpacity
                style={styles.recordButton}
                onPress={handleStartRecording}
              >

                <Text style={styles.buttonText}>
                  ● Grabar
                </Text>

              </TouchableOpacity>

            </View>
          )}


          {/* ==================================================
              GRABANDO
          ================================================== */}

          {recordingStatus === 'recording' && (
            <View style={styles.controls}>

              <Text style={styles.recordingText}>
                ● Grabando...
              </Text>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePauseRecording}
              >

                <Text style={styles.buttonText}>
                  Ⅱ Pausar
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteRecording}
              >

                <Text style={styles.buttonText}>
                  🗑 Eliminar
                </Text>

              </TouchableOpacity>

            </View>
          )}


          {/* ==================================================
              PAUSADO
          ================================================== */}

          {recordingStatus === 'paused' && (
            <View style={styles.controls}>

              <Text style={styles.pausedText}>
                Grabación pausada
              </Text>

              <TouchableOpacity
                style={styles.recordButton}
                onPress={handleResumeRecording}
              >

                <Text style={styles.buttonText}>
                  ▶ Continuar
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >

                <Text style={styles.buttonText}>
                  ✓ Guardar
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteRecording}
              >

                <Text style={styles.buttonText}>
                  🗑 Eliminar
                </Text>

              </TouchableOpacity>

            </View>
          )}


          {/* ==================================================
              GRABACIÓN TERMINADA / LISTA PARA GUARDAR
          ================================================== */}

          {recordingStatus === 'recorded' && (
            <View style={styles.controls}>

              <Text style={styles.readyText}>
                Audio grabado
              </Text>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >

                <Text style={styles.buttonText}>
                  ✓ Guardar
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteRecording}
              >

                <Text style={styles.buttonText}>
                  🗑 Eliminar
                </Text>

              </TouchableOpacity>

            </View>
          )}

        </View>

      </View>

    </Modal>
  );
};


// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: '85%',
    backgroundColor: '#181622',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E1D29',
  },

  title: {
    color: '#DED1EB',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
  },

  controls: {
    alignItems: 'center',
    gap: 12,
  },

  recordButton: {
    backgroundColor: '#853ACF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryButton: {
    backgroundColor: '#292635',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  saveButton: {
    backgroundColor: '#4D8B61',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  deleteButton: {
    backgroundColor: '#3A2930',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  recordingText: {
    color: '#E58B8B',
    fontSize: 14,
    fontWeight: 'bold',
  },

  pausedText: {
    color: '#E0B878',
    fontSize: 14,
    fontWeight: 'bold',
  },

  readyText: {
    color: '#9AD1A8',
    fontSize: 14,
    fontWeight: 'bold',
  },

});

export default ModalGrabarAudio;