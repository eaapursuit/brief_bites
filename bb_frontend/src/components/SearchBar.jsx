import { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function SearchNews() {
  //Basic State
  const [searchTerm, setSearchTerm] = useState("");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  //Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    regions: [],
    languages: [],
  });

  const [selectedFilters, setSelectedFilters] = useState({
    language: "",
    country: "INT",
    category: "",
    type: "",
    start_date: null,
    end_date: null,
    page_size: 30,
  });

  // Section loading states
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  //Fetch the filtering options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilters(true);
      
      try {
        const response = await fetch("/api/newsSearches/filters");
        console.log("Response status:", response.status);
        const contentType = response.headers.get("content-type");
        console.log("Content-Type:", contentType)

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const rawText = await response.text();
        console.log("Raw response:", rawText);

        let data;
        try {
          data = JSON.parse(rawText);
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          throw new Error("Invalid JSON response from server");
        }

        if(!data || typeof data !== 'object'){
          throw new Error("Invalid data structure received");
        }

        setFilterOptions({
          categories: Array.isArray(data.categories) ? data.categories : [],
          regions: Array.isArray(data.regions) ? data.regions : [],
          languages: Array.isArray(data.languages) ? data.languages : [],
        });
      } catch (error) {
        console.error("Full error details:", error);
        setError("Failed to load filter options: " + error.message);
      } finally {
        setLoadingFilters(false);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Search function that also handles errors
  const fetchNews = useCallback(
    async (page = 1, resetResults = false) => {
      const loadingState = page === 1 ? setLoading : setLoadingMore;
      loadingState(true);
      setError(null);

      try {
        //Building the parameters for the query
        const params = new URLSearchParams({
          q: searchTerm,
          page_number: page,
          page_size: pageSize,
          ...Object.fromEntries(
            Object.entries(selectedFilters).filter(
              ([key, value]) => value !== null && value !== ""
            )
          ),
        });

        //Format dates if they are present
        if (selectedFilters.start_date) {
          params.set("start_date", formatDate(selectedFilters.start_date));
        }
        if (selectedFilters.end_date) {
          params.set("end_date", formatDate(selectedFilters.end_date));
        }

        const response = await fetch(`/api/news/search?${params}`);
        if (!response.ok) throw new Error("Search request failed");

        const data = await response.json();

        //Update news state based on pagination
        setNews((prevNews) =>
          resetResults ? data.news : [...prevNews, ...data.news]
        );
        setTotalPages(Math.ceil(data.total_hits / pageSize));
        setCurrentPage(page);
      } catch (error) {
        setError("Failed to fetch news: " + error.message);
      } finally {
        loadingState(false);
      }
    },
    [searchTerm, selectedFilters, pageSize]
  );

  //Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentPage(1);  // Reset to the first page
    try {
      const response = await fetch(`/api/newsSearches/search?q=${searchTerm}&page=${1}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error("Failed to fetch news");
      const data = await response.json();
      setNews(data.news); // Assuming API returns news array in `data.news`
      setTotalPages(data.totalPages || 0); // Set total pages if available
    } catch (error) {
      setError("Failed to fetch news: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  //Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  //Reset filters
  const resetFilters = () => {
    setSelectedFilters({
      language: "",
      country: "INT",
      category: "",
      type: "",
      start_date: null,
      end_date: null,
      page_size: 30,
    });
  };

  // Format date for API
  const formatDate = (date) => {
    return date.toISOString();
  };

  //Load more results
  const loadMore = async () => {
    if (currentPage >= totalPages) return; // Don't load more if already at last page
    setLoadingMore(true);
    try {
      const response = await fetch(`/api/newsSearches/search?q=${searchTerm}&page=${currentPage + 1}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error("Failed to fetch more news");
      const data = await response.json();
      setNews((prevNews) => [...prevNews, ...data.news]); // Append new results
      setCurrentPage((prevPage) => prevPage + 1); // Move to next page
    } catch (error) {
      setError("Failed to fetch more news: " + error.message);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="news-search">
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      <form onSubmit={handleSearch} id="filter-form">
        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search news..."
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          <button type="button" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="filters-container">
            {loadingFilters ? (
              <div>Loading filters...</div>
            ) : (
              <>
                <div className="filters-container">
                  {/* Language Filter */}
                  <select
                    value={selectedFilters.language}
                    onChange={(e) =>
                      handleFilterChange("language", e.target.value)
                    }
                  >
                    <option value="">Select language</option>
                    {filterOptions.languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>

                  {/* Category Filter */}
                  <select
                    value={selectedFilters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                  >
                    <option value="">Select Category</option>
                    {filterOptions.categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  {/* {Region Filter} */}
                  <select
                    value={selectedFilters.country}
                    onChange={(e) =>
                      handleFilterChange("country", e.target.value)
                    }
                  >
                    <option value="INT">International</option>
                    {filterOptions.regions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </select>

                  {/* Type Filter */}
                  <select
                    value={selectedFilters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="1">News</option>
                    <option value="2">Article</option>
                    <option value="3">Discussion</option>
                  </select>

                  {/* Date Range Filters */}
                  <div className="date-filters">
                    <DatePicker
                      key="start-date"
                      selected={selectedFilters.start_date}
                      onChange={(date) => handleFilterChange("start_date", date)}
                      placeholderText="Start Date"
                      maxDate={selectedFilters.end_date || new Date()}
                    />
                    <DatePicker
                    key="end_date"
                      selected={selectedFilters.end_date}
                      onChange={(date) => handleFilterChange("end_date", date)}
                      placeholderText="End Date"
                      minDate={selectedFilters.start_date}
                      maxDate={new Date()}
                    />
                  </div>

                  {/* {Page Size Selector} */}
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value="10">10 per page</option>
                    <option value="30">30 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="reset-filters"
                  >
                    Reset Filters
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </form>

      {totalPages > 1 && (
        <div className='pagination-info'>
          Page {currentPage} of {totalPages}
        </div>
      )}


      {/* {Results} */}
      <div className="news-results">
        {news.map((article) => (
          <div key={article.id} className="news-item">
            <h3>{article.title}</h3>
            <p>{article.article_description}</p>
            {article.image && <img src={article.image} alt={article.title} />}
            <p>Category: {article.category}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        ))}

        {currentPage < totalPages && (
          <button onClick={loadMore} disabled={loadMore}>
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchNews;
