// client/src/hooks/usePagination.js
import React from 'react';

/**
 * Petit hook pour piloter une pagination uniforme côté client.
 * - state: page, limit
 * - meta: { page, limit, total, pages } (rempli par l'API)
 * - helpers: setPage, setLimit, setMeta, onPageChange
 */
export default function usePagination(initial = { page: 1, limit: 20 }) {
  const [page, setPage] = React.useState(
    Number(initial.page || 1) > 0 ? Number(initial.page || 1) : 1
  );
  const [limit, setLimit] = React.useState(
    Number(initial.limit || 20) > 0 ? Number(initial.limit || 20) : 20
  );
  const [meta, setMeta] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const onPageChange = (next) => {
    const n = Number(next || 1);
    setPage(n > 0 ? n : 1);
  };

  return { page, setPage, limit, setLimit, meta, setMeta, onPageChange };
}
