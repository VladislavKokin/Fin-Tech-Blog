export const updatePost = ({ id, title, imageUrl, content }) =>
  fetch(`http://localhost:3005/posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      title,
      image_url: imageUrl,
      content,
    }),
  }).then((loadedPost) => loadedPost.json());
