import { useLang } from '@/context/LanguageContext';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilter({ tags, selectedTags, onToggle, onClear }: TagFilterProps) {
  const { t } = useLang();

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onClear}
        className={`tag-pill rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
          selectedTags.length === 0
            ? 'bg-accent-500 text-white'
            : 'bg-base-800 text-slate-400 hover:bg-base-700 hover:text-slate-200'
        }`}
      >
        {t.allTags}
      </button>
      {tags.map((tag) => {
        const active = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`tag-pill rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
              active
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                : 'bg-base-800 text-slate-400 hover:bg-base-700 hover:text-slate-200'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
