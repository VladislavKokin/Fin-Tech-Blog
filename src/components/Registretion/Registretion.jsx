import { useState } from 'react'
import { createPortal } from 'react-dom'
import { emailChangeScheme, 
    passwordChangeScheme, 
    repeatPasswordChangeScheme, 
    validateAndGetErrorMessage,
    sendData 
} from './Validate'
import styles from "./Registretion.module.css"

export const Registretion = ({onClose}) => {
    const [email, setEmail] = useState('');
    const [errorEmail, setErrorEmail] = useState(null);

    const [password, setPassword] = useState('');
    const [errorPassword, setErrorPassword] = useState(null)

    const [repeatPassword, setRepeatPassword] = useState('')
    const [errorRepeatPassword, setErrorRepeatPassword] = useState(null)

    const onEmailChange = ({ target }) => {
        setEmail(target.value);
        const error = validateAndGetErrorMessage(emailChangeScheme, target.value);
        setErrorEmail(error)
    }

    const onPasswordChange = ({ target }) => {
        setPassword(target.value);
        const error = validateAndGetErrorMessage(passwordChangeScheme, target.value);
        setErrorPassword(error)
    }

    const onRepeatPasswordChange = ({ target }) => {
        setRepeatPassword(target.value);
        const error = validateAndGetErrorMessage(
            repeatPasswordChangeScheme(password),
            target.value
        );
        setErrorRepeatPassword(error)
    }

    const onSubmit = (event) => {
        event.preventDefault();
        sendData({ email, password });
    }

    return createPortal(
            <div className={styles.overlay} role="presentation" onClick={onClose}>
                <div
                    className={styles.dialog}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="register-title"
                    onClick={(e) => e.stopPropagation()}
                >
                    <form onSubmit={onSubmit}>
                        <h2 className={styles.signIn}>Зарегистрироваться</h2>
                        <div className={styles.inputContainer}>
                            <label className={styles.labels}>Адрес электронной почты</label>
                            <input
                                className={styles.inputs}
                                type="email"
                                name="email"
                                value={email}
                                onChange={onEmailChange}
                            />
                            {errorEmail && (
                                <div className={styles.error}>{errorEmail}</div>
                            )}
                        </div>
                        <div className={styles.inputContainer}>
                            <label className={styles.labels}>Пароль</label>
                            <input
                                className={styles.inputs}
                                type="password"
                                name="password"
                                value={password}
                                onChange={onPasswordChange}
                            />
                            {errorPassword && (
                                <div className={styles.error}>{errorPassword}</div>
                            )}
                        </div>
                        <div className={styles.inputContainer}>
                            <label className={styles.labels}>Подтверждение пароля</label>
                            <input className={styles.inputs}
                                type="password"
                                name="repeatPassword"
                                value={repeatPassword}
                                onChange={onRepeatPasswordChange} />
                            {errorRepeatPassword && (
                                <div className={styles.error}>{errorRepeatPassword}</div>
                            )}
                        </div>
                        <button className={styles.buttonSignIn} type="submit" 
                            disabled={errorEmail !== null || errorPassword !== null || !!errorRepeatPassword}>
                            Создать аккаунт
                        </button>
                    </form>
                </div>
            </div>,
        document.body
    )
}