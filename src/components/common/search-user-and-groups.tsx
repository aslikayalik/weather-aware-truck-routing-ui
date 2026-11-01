import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useSearchUserAndGroupQuery } from '@services/commonApi';
import { SearchUserAndGroup } from '@app/types/common';
import { useTranslation } from 'react-i18next';
import { isArray, isObject } from 'lodash';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

interface ISearchAutocompleteProps {
  objectType?: string; // Optional: Can filter by object type (user/group)
  multiple?: boolean;  // Allow multiple selections
  onChange: (value: SearchUserAndGroup | SearchUserAndGroup[] | null) => void;  // Handle selection changes
  disabled?: boolean;
  showIcons?: boolean; // New prop to control the display of icons
}

const SearchUserAndGroupAutocomplete = ({ objectType, multiple = false, onChange, disabled, showIcons = false }: ISearchAutocompleteProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users/groups based on search term
  const { data: options = [], isFetching } = useSearchUserAndGroupQuery(
    { query: searchTerm, object_type: objectType || undefined },
    { skip: searchTerm.length < 1 }
  );

  // Handle input change (search term)
  const handleInputChange = (_: React.ChangeEvent<unknown>, value: string) => {
    setSearchTerm(value);
  };

  // Render text for each option based on type
  const getOptionText = (option: SearchUserAndGroup) => {
    if (option?.object_type === 'user') {
      return option.text?.split(',')[2]?.trim() || t('user.unknown');
    } else if (option?.object_type === 'user_group') {
      return option.text || t('group.unknown');
    }
    return t('search.unknown');
  };

  return (
    <Autocomplete
      multiple={multiple}
      id="search-autocomplete"
      options={options}
      getOptionLabel={getOptionText} // Customize how options are displayed in the dropdown
      isOptionEqualToValue={(option, value) => option.id === value.id} // Ensure equality check is done by `id`
      loading={isFetching}
      onInputChange={handleInputChange}
      disabled={disabled}
      onChange={(_, newValue) => {
        if (multiple && isArray(newValue)) {
          onChange(newValue as SearchUserAndGroup[]); // Return array when multiple selection is allowed
        } else if (isObject(newValue)) {
          onChange(newValue as SearchUserAndGroup); // Return single value
        } else {
          onChange(null); // Handle case where no selection is made
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label={t('search.title')} variant="outlined" />
      )}
      noOptionsText={t('search.noOptionsText')} // Text when no options are available
      style={{ width: 300 }} // Set fixed width
      renderOption={(optionProps, option) => (
        <li {...optionProps} key={option.id}>
          {showIcons && ( // Conditionally render icons based on the showIcons prop
            option.object_type === 'user_group' ? (
              <GroupIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
            ) : (
              <PersonIcon sx={{ fontSize: 20, color: 'secondary.main', mr: 1 }} />
            )
          )}
          {getOptionText(option)}
        </li>
      )}
    />
  );
};

export default SearchUserAndGroupAutocomplete;
