import { createStore } from "vuex";
import {
    loadAndDecryptFromLocalStorage,
    removeFromLocalStorage,

} from "./loacalStorage";
import { jashyruunAchkych, lsKey } from "../DataArr";
import {sendRequest, reqFailure, reqSuccess} from "./api";

export const store = createStore({
    state: {
        username: '',
        email: '',
        token: '',
        userId: '',
        message: '',
        loggedIn: false, // Начальное значение изменено на false, так как изначально пользователь не вошел
    },
    getters: {
        isLoggedIn: (state) => state.loggedIn,
        getUserId: (state) => state.userId,
        getUserMessage: (state) => state.message,
    },
    mutations: {
        // Мутация для обновления данных пользователя
        setUserData(state, userData) {
            state.username = userData.user.username;
            state.email = userData.user.email;
            state.token = userData.token;
            state.userId= userData.user._id;
            state.loggedIn = true;
        },
        logoutUser(state) {
            state.username = '';
            state.email = '';
            state.token = '';
            state.loggedIn = false;
        },
        clearUserMessage(state) {
            state.message = '';
        }
    },
    actions: {
        async initializeUser({ commit }) {
            try {
                const kardar = loadAndDecryptFromLocalStorage(lsKey, jashyruunAchkych);
                if (kardar) {
                    // Если есть токен и данные пользователя в Local Storage, инициализируем хранилище
                    await sendRequest(commit, {
                        endpoint: 'users/session',
                        data: {userId: kardar.userId },
                        successCallback: reqSuccess,
                        errorCallback: reqFailure,
                        mutation: 'setUserData',
                        token: kardar.token
                    });
                }
            } catch (e) {
                // Обработайте ошибку здесь (например, показ сообщения об ошибке)
                console.error('Ошибка при выполнении POST-запроса:', e);
            }
        },
        async register({ commit }, userData) {
            try {
                await sendRequest(commit, {
                    endpoint: 'users/register',
                    data: userData,
                    token: null,
                    successCallback: reqSuccess,
                    errorCallback: reqFailure,
                    mutation: 'setUserData'
                });
            } catch (error) {
                // Обработайте ошибку здесь
                console.error('Ошибка при выполнении POST-запроса:', error);
            }
        },

        async login({ commit }, userData) {
            try {
                await sendRequest(commit, {
                    endpoint: 'users/login',
                    data: userData,
                    successCallback: reqSuccess,
                    errorCallback: reqFailure,
                    mutation: 'setUserData',
                    token: null
                });
            } catch (e) {
                // Обработайте ошибку здесь (например, показ сообщения об ошибке)
                console.error('Ошибка при выполнении POST-запроса:', e);
            }
        },

        logout({ commit }) {
            // Выход пользователя: удалите данные из Local Storage и обновите состояние
            removeFromLocalStorage(lsKey);
            console.log('logout in action !');
            commit('logoutUser');
        },
    },
});

export default store;
