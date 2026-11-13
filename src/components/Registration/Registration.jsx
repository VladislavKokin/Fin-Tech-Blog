import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { server } from '../../../shared/api/index.js';
import styles from "./registration.module.css"
import { setUser } from '../../store/action/set-user'
import PropTypes from 'prop-types'

const authFormSchema = yup.object().shape({
    login: yup
        .string()
        .required('Заполнить логин')
        .matches(/^\w+$/, 'Неверный логин. Допускаются только буквы и цыфры')
        .min(3, 'Неверный логин. Допускаются минимум 3 символа')
        .max(15, 'Неверный логин. Допускаются максимум 15 символов'),
    password: yup
        .string()
        .required('Заполнить пароль')
        .matches(
        /^(?=.*?[A-Z])(?=.*?\d)(?=.*?[-#$%!@&*?])[A-Za-z\d\-#$%!@&*?]{8,20}$/,
        "Пароль должен содержать от 8 до 20 символов,включая хотя бы одну заглавную букву, цифру и специальный символ."
    ),
    confirmPassword: yup.string().required('Подтвердите пароль').oneOf([yup.ref('password')], 'Пароли не совпадают'),
})

export const Registration = ({onClose}) => {
    const dispatch = useDispatch();
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            login: '',
            password: '',
            confirmPassword: '',
        },
        resolver: yupResolver(authFormSchema)
    });

    const [serverError, setServerError] = useState('');

    const onSubmit = ({ login, password}) => {
        setServerError('')
        return server.register(login, password).then(({ error, res }) => {
            if (error) {
                setServerError(`Ошибка запроса: ${error}`);
                return;
            }
            dispatch(setUser(res));
            onClose()
        })
    }

    const formError = errors?.login?.message || errors?.password?.message || errors?.confirmPassword?.message
    const errorMassage = formError || serverError
    

    return createPortal(
            <div className={styles.overlay} role="presentation" onClick={onClose}>
                <div
                    className={styles.dialog}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="register-title"
                    onClick={(e) => e.stopPropagation()}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <h2 className={styles.signIn}>Регистрация</h2>
                        <div className={styles.inputContainer}>
                            <input
                                className={styles.inputs}
                                placeholder='Логин'
                                type="text"
                                name="login"
                                {...register('login')}
                                // value={email}
                                // onChange={onEmailChange}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <input
                                className={styles.inputs}
                                placeholder='Пароль'
                                type="password"
                                name="password"
                                {...register('password')}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <input
                                className={styles.inputs}
                                placeholder='Подтверждение пароля'
                                type="password"
                                name="confirmPassword"
                                {...register('confirmPassword')}
                            />
                        </div>
                        <button className={styles.buttonSignIn} type="submit"
                            disabled={isSubmitting || !!formError}>
                            Создать аккаунт
                        </button>
                        {errorMassage && (<div className={styles.error}>{errorMassage}</div>)}
                    </form>
                </div>
            </div>,
        document.body
    )
}

Registration.propTypes = {
    onClose: PropTypes.func.isRequired,
}
