import {Autocomplete} from "@/components";
import {useUserSearch} from "@/hooks/useUserSearch";
import {IOption} from "@/types/ui";

export interface IProps {
  selectedManager?: IOption;
  assignManager: (manager: IOption) => void;
}

export function UserManager({assignManager, selectedManager}: IProps) {
  const {setSearchTerm, searchResults, loading} = useUserSearch();

  return (
    <Autocomplete
      label="Manager"
      loading={loading}
      value={{
        label: selectedManager?.label || "",
        value: selectedManager?.value || "",
      }}
      options={searchResults}
      onSearch={(option) => setSearchTerm(option)}
      onChange={async (option) => {
        if (!option) return;
        assignManager(option);
      }}
    />
  );
}
