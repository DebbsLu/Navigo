import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import {
  PROBLEM_DATA,
  ProblemCategory,
  ProblemType,
  ProblemSolution,
} from '../data/ProblemData';

interface ModalProblemasProps {
  onSelectSolution?: (
    problem: ProblemType,
    solution: ProblemSolution
  ) => void;

  onSubmitCustomProblem?: (
    text: string,
    category?: ProblemCategory
  ) => void;

  onAddCustomSolution?: (
    text: string,
    problem: ProblemType
  ) => void;

  style?: ViewStyle;
}

type ModalStep =
  | 'categories'
  | 'problems'
  | 'solutions';

const ModalProblemas: React.FC<ModalProblemasProps> = ({
  onSelectSolution,
  onAddCustomSolution,
  style,
}) => {
  // =====================================================
  // ESTADO
  // =====================================================

  const [step, setStep] =
    useState<ModalStep>('categories');

  const [selectedCategory, setSelectedCategory] =
    useState<ProblemCategory | null>(null);

  const [selectedProblem, setSelectedProblem] =
    useState<ProblemType | null>(null);

  const [customText, setCustomText] =
    useState('');

  // =====================================================
  // SELECCIONAR CATEGORÍA
  // =====================================================

  const handleSelectCategory = (
    category: ProblemCategory
  ) => {
    setSelectedCategory(category);
    setSelectedProblem(null);
    setCustomText('');
    setStep('problems');
  };

  // =====================================================
  // SELECCIONAR PROBLEMA
  // =====================================================

  const handleSelectProblem = (
    problem: ProblemType
  ) => {
    setSelectedProblem(problem);
    setCustomText('');
    setStep('solutions');
  };

  // =====================================================
  // PROBLEMA PERSONALIZADO
  // =====================================================

  const handleSendCustomProblem = () => {
    const text = customText.trim();

    if (!text) {
      return;
    }

    const customProblem: ProblemType = {
      id: `custom_problem_${Date.now()}`,
      title: text,
      description:
        'Problema personalizado por el usuario.',
      solutions: [],
    };

    setSelectedProblem(customProblem);
    setCustomText('');
    setStep('solutions');
  };

  // =====================================================
  // SELECCIONAR SOLUCIÓN
  // =====================================================

  const handleSelectSolution = (
    solution: ProblemSolution
  ) => {
    if (!selectedProblem) {
      return;
    }

    if (onSelectSolution) {
      onSelectSolution(
        selectedProblem,
        solution
      );
    }
  };

  // =====================================================
  // SOLUCIÓN PERSONALIZADA
  // =====================================================

  const handleSendCustomSolution = () => {
    const text = customText.trim();

    if (!text || !selectedProblem) {
      return;
    }

    if (onAddCustomSolution) {
      onAddCustomSolution(
        text,
        selectedProblem
      );
    }
  };

  // =====================================================
  // VOLVER
  // =====================================================

  const handleBack = () => {
    setCustomText('');

    if (step === 'solutions') {
      setSelectedProblem(null);
      setStep('problems');
      return;
    }

    if (step === 'problems') {
      setSelectedCategory(null);
      setStep('categories');
      return;
    }
  };

  // =====================================================
  // PREGUNTA
  // =====================================================

  const getQuestionText = () => {
    if (step === 'categories') {
      return '¿Qué te está frenando?';
    }

    if (step === 'problems') {
      return '¿Cuál de estos problemas tienes?';
    }

    return '¿Cómo quieres resolverlo?';
  };

  // =====================================================
  // OPCIONES
  // =====================================================

  let options: any[] = [];

  if (step === 'categories') {
    options = PROBLEM_DATA;
  }

  if (
    step === 'problems' &&
    selectedCategory
  ) {
    options = selectedCategory.problems;
  }

  if (
    step === 'solutions' &&
    selectedProblem
  ) {
    options = selectedProblem.solutions;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <LinearGradient
      colors={[
        '#0E1C36',
        '#28519C',
      ]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[
        styles.container,
        style,
      ]}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.headerRow}>

        {step !== 'categories' && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}

        <Text style={styles.headerTitle}>
          Problemas: ¡Se pueden superar!
        </Text>

      </View>

      {/* =================================================
          PREGUNTA
      ================================================= */}

      <Text style={styles.questionText}>
        {getQuestionText()}
      </Text>

      {/* =================================================
          OPCIONES
      ================================================= */}

      <View
        style={[
          styles.gridContainer,
          step === 'solutions' &&
            styles.solutionsContainer,
        ]}
      >

        {options.map((item: any) => {

          // ===============================================
          // CATEGORÍA
          // ===============================================

          if (step === 'categories') {
            const category =
              item as ProblemCategory;

            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.7}
                style={styles.optionButton}
                onPress={() =>
                  handleSelectCategory(
                    category
                  )
                }
              >
                <Text
                  style={
                    styles.optionTitleText
                  }
                >
                  {category.title}
                </Text>

                <Text
                  style={
                    styles.optionSubtitleText
                  }
                >
                  {category.subtitle}
                </Text>
              </TouchableOpacity>
            );
          }

          // ===============================================
          // PROBLEMA
          // ===============================================

          if (step === 'problems') {
            const problem =
              item as ProblemType;

            return (
              <TouchableOpacity
                key={problem.id}
                activeOpacity={0.7}
                style={styles.problemButton}
                onPress={() =>
                  handleSelectProblem(
                    problem
                  )
                }
              >
                <Text
                  style={
                    styles.optionTitleText
                  }
                >
                  {problem.title}
                </Text>

                <Text
                  style={
                    styles.optionSubtitleText
                  }
                >
                  {problem.description}
                </Text>
              </TouchableOpacity>
            );
          }

          // ===============================================
          // SOLUCIÓN
          // ===============================================

          const solution =
            item as ProblemSolution;

          return (
            <TouchableOpacity
              key={solution.id}
              activeOpacity={0.7}
              style={styles.solutionButton}
              onPress={() =>
                handleSelectSolution(
                  solution
                )
              }
            >
              <Text
                style={
                  styles.solutionTitleText
                }
              >
                {solution.title}
              </Text>

              <Text
                style={
                  styles.solutionDescriptionText
                }
              >
                {solution.description}
              </Text>
            </TouchableOpacity>
          );
        })}

      </View>

      {/* =================================================
          INPUT PERSONALIZADO
      ================================================= */}

      <Text
        style={[
          styles.questionText,
          styles.secondQuestion,
        ]}
      >
        {step === 'solutions'
          ? 'O escribe tu propia solución:'
          : step === 'problems'
          ? '¿No encuentras tu problema?'
          : 'O escribe el problema que tienes:'}
      </Text>

      <View style={styles.inputContainer}>

        <TextInput
          style={styles.textInput}
          placeholder={
            step === 'solutions'
              ? 'Escribe una solución...'
              : 'Escribe tu problema...'
          }
          placeholderTextColor="#5978B7"
          value={customText}
          onChangeText={setCustomText}
          multiline={
            step === 'solutions'
          }
        />

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.sendButton}
          onPress={
            step === 'solutions'
              ? handleSendCustomSolution
              : handleSendCustomProblem
          }
        >
          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>

      </View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: '#1F386A',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginHorizontal: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#5C77B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  questionText: {
    color: '#5978B7',
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 12,
  },

  secondQuestion: {
    marginTop: 20,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },

  solutionsContainer: {
    flexDirection: 'column',
  },

  optionButton: {
    width: '48%',
    backgroundColor: '#0E1C36',
    borderColor:
      'rgba(92, 119, 183, 0.24)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  problemButton: {
    width: '48%',
    backgroundColor: '#0E1C36',
    borderColor:
      'rgba(92, 119, 183, 0.24)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  solutionButton: {
    width: '100%',
    backgroundColor: '#0E1C36',
    borderColor:
      'rgba(92, 119, 183, 0.24)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  optionTitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },

  optionSubtitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
  },

  solutionTitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },

  solutionDescriptionText: {
    color: '#B7C7E8',
    fontSize: 13,
    lineHeight: 18,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1C36',
    borderColor:
      'rgba(92, 119, 183, 0.24)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    minHeight: 52,
  },

  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingRight: 10,
    paddingVertical: 10,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#5C77B7',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ModalProblemas;