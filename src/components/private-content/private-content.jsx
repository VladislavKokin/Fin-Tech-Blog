import { useSelector } from 'react-redux'
import { selectUserRole } from '../../selectors'
import { checkAccess } from '../../utils'
import { ERROR } from '../../bff/constants';
import { Error } from '../error/error';
// import styles from './private-content.module.css'
import PropTypes from 'prop-types'
import { PROP_TYPE } from '../../constants'

export const PrivateContent = ({ children, access, serverError = null }) => {
    const userRole = useSelector(selectUserRole);

    const accessError = checkAccess(access, userRole) ? null : ERROR.ACCESS_DENIED;
    const error = serverError || accessError;

    return error ? <Error error={error} />  : children
}

PrivateContent.propTypes = {
    children: PropTypes.node.isRequired,
    access: PropTypes.arrayOf(PROP_TYPE.ROLE_ID).isRequired,
    serverError: PropTypes.string,
}