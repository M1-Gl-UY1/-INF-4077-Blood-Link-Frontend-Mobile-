/**
 * Composant PickerField - Champ de sélection avec modal
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ModalPicker from './ModalPicker';
import { COLORS } from '../constants/colors';

interface PickerOption {
  value: string;
  label: string;
}

interface PickerFieldProps {
  label: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const PickerField: React.FC<PickerFieldProps> = ({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Sélectionnez',
  disabled = false,
  error = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerContainer, error && styles.pickerError]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
        >
          {displayText}
        </Text>
        <Icon
          name="chevron-down"
          size={20}
          color={disabled ? COLORS.GRAY_LIGHT : COLORS.BLACK}
        />
      </TouchableOpacity>

      <ModalPicker
        visible={modalVisible}
        options={options}
        selectedValue={value}
        onSelect={onValueChange}
        onClose={() => setModalVisible(false)}
        title={label}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  pickerError: {
    borderColor: COLORS.PRIMARY_RED,
    borderWidth: 2,
  },
  pickerText: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  placeholderText: {
    color: COLORS.GRAY_LIGHT,
  },
  disabledText: {
    color: COLORS.GRAY_LIGHT,
  },
});

export default PickerField;
