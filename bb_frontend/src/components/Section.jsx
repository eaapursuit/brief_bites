import { useState, useEffect, createContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getNYTArticles } from "./fetch";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@radix-ui/react-navigation-menu";
import "./Section.css";
import main from "./OpenAi";

export const SummaryContext = createContext(null);

const Section = ({ sections }) => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState("");
  const [articles, setArticles] = useState([]);
  const { id } = useParams();
  useEffect(() => {
    getNYTArticles(sections[id])
      .then((results) => {
        setArticles(results);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleClick = async (articles) => {
    const response = await main(articles)
     setSummary(response)
  };

  console.log(summary)

  return (
    <SummaryContext.Provider
      value={{ summary, setSummary, articles, setArticles }}
    > 
    {
            (summary) ? <div>{summary}</div> : (
                <div>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuLink>
                          <Link className="home-link" to={"/"}>
                            Home
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <h1>{sections[id]}</h1>
                  {articles.length > 0 &&
                    articles.map((article) => (
                      <li key={article.slug_name}>
                        <Link to={article.url} target="_blank">
                          {article.title}
                        </Link>
                        <p>{article.abstract}</p>
                        <button onClick={() => handleClick(article)}>
                          Summarize for 8th Graders + Below
                        </button>
                        <button>Summarize for High Schoolers</button>
                        <button>Summarize for Adults</button>
                      </li>
                    ))}
                </div>
                )  
    }

    </SummaryContext.Provider>
  );
};

export default Section;
