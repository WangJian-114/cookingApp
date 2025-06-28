import { createContext, useContext, useState } from 'react';

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});

  return (
    <SearchContext.Provider value={{ query, setQuery, filters, setFilters }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
