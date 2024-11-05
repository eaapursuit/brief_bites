const URL = import.meta.env.VITE_BASE_URL;

// Article/Get one
export function getOneArticle(id) {
    return fetch(`${URL}/api/articles/${id}`, { credentials: "include" }).then((response) => response.json());
}

// Create
export function createArticle (article, moreOptions = {}) {
    const options = {
      ...moreOptions,
      method: "POST",
      body: JSON.stringify({
        article: article,
      }),
    };
    return fetch(`${URL}/api/articles/`, options).then((response) => {
      return response.json();
    });
  }