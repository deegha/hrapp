import {useEffect, useRef, useState} from "react";
import {searchUserService} from "@/services/userService";

export type TSearchResult = {
  label: string;
  value: string;
};

export function useUserSearch(delay = 900) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<TSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setError(null);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      fetchUsers(searchTerm);
    }, delay);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, delay]);

  const fetchUsers = async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchUserService(term);
      if (response.error) {
        setError("Failed to fetch user data");
        setSearchResults([]);
        return;
      }
      if (!response.data || response.data.length === 0) {
        setSearchResults([]);
        return;
      }
      setSearchResults(
        response.data.map((user) => ({
          label: `${user.firstName} ${user.lastName}`,
          value: user?.employeeId?.toString() || "",
        })),
      );
    } catch {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    loading,
    error,
  };
}
