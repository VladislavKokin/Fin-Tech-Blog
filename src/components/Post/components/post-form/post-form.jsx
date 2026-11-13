import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useServerRequest} from '../../../../hooks'
import { savePostAsync } from '../../../../store/action'

import { SpecialPanel } from '../special-panel/special-panel'
import { Error } from '../../../error/error'
import styles from './post-form.module.css'
import PropTypes from 'prop-types'
import { PROP_TYPE } from '../../../../constants'

export const PostForm = ({ id, post }) => {
    const [error, setError] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const titleRef = useRef(null)
    const imageRef = useRef(null)
    const contentIntroductionRef = useRef(null)
    const contentBodyRef = useRef(null)
    const contentConclusionRef = useRef(null)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const requestServer = useServerRequest()

    const onSave = () => {
        if (isSaving) return
        setIsSaving(true)
        setError(null)
        const newTitleRef = titleRef.current.value;
        const newImageRef = imageRef.current.value;
        const newContentIntroductionRef = contentIntroductionRef.current.value;
        const newContentBodyRef = contentBodyRef.current.value;
        const newContentConclusionRef = contentConclusionRef.current.value;

        dispatch(
            savePostAsync(requestServer,{
                id,
                title: newTitleRef,
                imageUrl: newImageRef,
                content: {
                    introduction: newContentIntroductionRef,
                    body: newContentBodyRef,
                    conclusion: newContentConclusionRef,
                },
            }),
        ).then(({ error, res }) => {
            setIsSaving(false)
            if (error) { setError(error); return }
            navigate(`/post/${res.id}`)
        })
    }

    return (
        <section className={styles.container}>
            <h2 className={styles.article}>
                {id ? 'Изменения' : 'Новая статья'}
            </h2>
            <SpecialPanel id={post.id} publishedAt={post.publishedAt} editButton={<button className={styles.buttonSave} onClick={onSave} disabled={isSaving} />}/>
            <input
                ref={titleRef}
                defaultValue={post.title}
                placeholder="Заголовок"
                aria-label="Заголовок"
            />
            <input
                ref={imageRef}
                defaultValue={post.imageUrl}
                placeholder="Изображение"
                aria-label="Изображение"
            />
            <textarea
                ref={contentIntroductionRef}
                defaultValue={post.content.introduction}
                placeholder="Вступление статьи"
                aria-label="Вступление статьи"
            />
            <textarea
                ref={contentBodyRef}
                defaultValue={post.content.body}
                placeholder="Основа статьи"
                aria-label="Основа статьи"
            />
            <textarea
                ref={contentConclusionRef}
                defaultValue={post.content.conclusion}
                placeholder="Заключение статьи"
                aria-label="Заключение статьи"
            />
            {error && <Error error={error} />}
        </section>
    )
}

PostForm.propTypes = {
    id: PropTypes.string,
    post: PROP_TYPE.POST.isRequired,
}

