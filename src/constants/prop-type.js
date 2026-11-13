import PropTypes from 'prop-types'
import { ROLE } from '../../shared/constants/index.js'

const ROLE_ID = PropTypes.oneOf(Object.values(ROLE))

const COMMENT = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    author: PropTypes.string,
    content: PropTypes.string.isRequired,
    publishedAt: PropTypes.string.isRequired,
})

export const PROP_TYPE = {
    ROLE_ID,
    ROLES: PropTypes.arrayOf(
        PropTypes.shape({
            id: ROLE_ID.isRequired,
            name: PropTypes.string.isRequired,
        })
    ),
    COMMENT,
    POST: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        imageUrl: PropTypes.string,
        content: PropTypes.shape({
            introduction: PropTypes.string,
            body: PropTypes.string,
            conclusion: PropTypes.string,
        }),
        publishedAt: PropTypes.string,
        comments: PropTypes.arrayOf(COMMENT),
    }),
}
