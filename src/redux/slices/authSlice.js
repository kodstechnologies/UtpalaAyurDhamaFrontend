// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//     user: JSON.parse(localStorage.getItem("user")) || null,
//     token: localStorage.getItem("token") || null,
//     role: localStorage.getItem("role") || null,
//     isAuthenticated: localStorage.getItem("token") ? true : false,
// };

// const authSlice = createSlice({
//     name: "auth",
//     initialState,
//     reducers: {
//         login: (state, action) => {
//             console.log("🚀 ~ state, action:", state, action)
//             const { user, token, role } = action.payload;

//             state.user = user;
//             state.token = token;
//             state.role = role;
//             state.isAuthenticated = true;

//             localStorage.setItem("user", JSON.stringify(user));
//             localStorage.setItem("token", token);
//             localStorage.setItem("role", role);
//         },

//         logout: (state) => {
//             state.user = null;
//             state.token = null;
//             state.role = null;
//             state.isAuthenticated = false;

//             localStorage.removeItem("user");
//             localStorage.removeItem("token");
//             localStorage.removeItem("role");
//         },
//     },
// });

// export const { login, logout } = authSlice.actions;
// export default authSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: (() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    })(),
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            const { user, token, role } = action.payload;

            state.user = user;
            state.token = token;
            state.role = role;
            state.isAuthenticated = true;

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;

            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
        },

        updateUser: (state, action) => {
            const updatedUser = { ...state.user, ...action.payload };
            state.user = updatedUser;
            localStorage.setItem("user", JSON.stringify(updatedUser));
        },
    },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;