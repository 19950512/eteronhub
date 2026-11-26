"use client";

import { MapPin } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { JobResults } from "./job-results";

export function JobBoard(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [location, setLocation] = useState(searchParams.get("local") ?? "");
  const [count, setCount] = useState<number | null>(null);
  const handleLoaded = useCallback((total: number) => setCount(total), []);

  function handleChange(value: string): void {
    setLocation(value);
    setCount(null);
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("local", value);
    else params.delete("local");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <div className="filter-bar">
        <div className="input-group">
          <MapPin aria-hidden="true" />
          <label htmlFor="filtro-local" className="sr-only">
            Filtrar por cidade ou região
          </label>
          <input
            id="filtro-local"
            className="input"
            type="search"
            inputMode="search"
            autoComplete="address-level2"
            placeholder="Cidade, estado ou região"
            value={location}
            onChange={(event) => handleChange(event.target.value)}
          />
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {count === null
            ? "Buscando vagas..."
            : `${count} ${count === 1 ? "vaga encontrada" : "vagas encontradas"}`}
        </p>
      </div>
      <JobResults location={location} onLoaded={handleLoaded} />
    </>
  );
}
