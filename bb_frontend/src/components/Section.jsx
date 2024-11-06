import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@components/ui/navigation-menu";
import "./Section.css";

const Section = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/articles/latest")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch articles");
        return response.json();
      })
      .then((data) => {
        setArticles(data.articles);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSummarize = async (articleId, summaryType) => {
    try {
      const response = await fetch(
        `/api/summary/${articleId}?type=${summaryType}`
      );
      if (!response.ok) throw new Error("Failed to get summary");
      const data = await response.json();

      //update the article with its summary
      setArticles(
        articles.map((article) =>
          article.id === articleId
            ? { ...article, summary: data.summary }
            : article
        )
      );
    } catch (err) {
      console.error("Error getting summary:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink>
              <Link className="home-link" to="/">
                Home
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="articles-grid">
        {articles.map((article) => (
          <div key={article.id} className="article-card">
            <h2>{article.title}</h2>
            <p>{article.article_description}</p>
            {!article.summary && (
            <div className="summary-buttons">
              <button onClick={() => handleSummarize(article.id, 8)}>
              Summarize for 8th Graders
              </button>
              <button onClick={() => handleSummarize(article.id, 12)}>
              Summarize for High Schoolers
              </button>
              <button onClick={() => handleSummarize(article.id, 13)}>
              Summarize for Adults
              </button>
            </div>  
            )}
            { article.summary && (
              <div className="summary">
                <h3>Summary</h3>
                <p>{article.summary}</p>
              </div>
            )}
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read full article
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Section;
