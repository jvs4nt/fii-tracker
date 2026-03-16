import type { ChangeEvent } from 'react';

interface TickerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (ticker: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (value: boolean) => void;
}

export default function TickerInput({
  value,
  onChange,
  onSelect,
  suggestions,
  showSuggestions,
  setShowSuggestions,
}: TickerInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value.toUpperCase());
    setShowSuggestions(true);
  };

  return (
    <div className="form-group">
      <label className="form-label">Ticker</label>
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder="HGLG11"
        autoComplete="off"
        required
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-dropdown">
          {suggestions.map((ticker) => (
            <li
              key={ticker}
              onClick={() => {
                onSelect(ticker);
                setShowSuggestions(false);
              }}
              className="suggestion-item"
            >
              {ticker}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
