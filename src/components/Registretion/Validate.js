import * as yup from 'yup'

export const emailChangeScheme = yup
    .string()
    .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Некорректный E-mail",
    );

export const passwordChangeScheme = yup
    .string()
    .matches(
        /^(?=.*?[A-Z])(?=.*?\d)(?=.*?[-#$%!@&*?])[A-Za-z\d\-#$%!@&*?]{8,20}$/,
        "Пароль должен содержать от 8 до 20 символов,включая хотя бы одну заглавную букву, цифру и специальный символ."
    );

export const repeatPasswordChangeScheme = (password) =>
    yup
        .string()
        .test(
            'password-match',
            'Пароли не совпадают',
            (value) => value === password
        );

export const validateAndGetErrorMessage = (schema, value) => {
    let errorMessage = null;

    try {
        schema.validateSync(value);
    } catch ({ errors }) {
        errorMessage = errors
            .reduce((message, error) => message + error)
            .trim();
    }

    return errorMessage;
};

 export const sendData = ({ email, password }) => {
    console.log({ email, password })
}