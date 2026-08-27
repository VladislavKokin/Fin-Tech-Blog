import styles from "./comment.module.css"

export const Comment = ({ author, content, publishedAt }) => {
    return (
        <div className={styles.container}>
            <div className={styles.border}>
                <div className={styles.info}>
                    <div>
                        <button className={styles.buttonUser} onClick={() => { }} />
                        {author}
                    </div>
                    <div>
                        <button className={styles.buttonCalendar} onClick={() => { }} />
                        {publishedAt}
                    </div>
                </div>
                <div className={styles.content}>{content}</div>
            </div>
            <button className={styles.buttonDelete} onClick={() => { }} />
        </div>
    )
}