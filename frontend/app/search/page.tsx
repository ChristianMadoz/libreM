import SearchResults from '@/pages/SearchResults';

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  return <SearchResults />;
}
