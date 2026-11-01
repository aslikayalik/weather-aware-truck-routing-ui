// settingsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

interface SettingsState {
    fontSize: number;
}

const DEFAULT_FONT_SIZE = 16;

// localStorage'dan oku veya default kullan
const getInitialFontSize = (): number => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE;
};

const initialState: SettingsState = {
    fontSize: getInitialFontSize(),
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setFontSize(state, action: PayloadAction<number>) {
            state.fontSize = action.payload;
            // Also persist it to localStorage
            localStorage.setItem('fontSize', action.payload.toString());
        },
    },
    extraReducers(builder) {
        builder.addCase(logout, (state) => {
            state.fontSize = DEFAULT_FONT_SIZE;
            localStorage.removeItem('fontSize');
        });
    },
});

export const { setFontSize } = settingsSlice.actions;
export default settingsSlice.reducer;