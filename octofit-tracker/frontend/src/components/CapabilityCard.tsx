import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  path: string;
  emptyText: string;
  isEmpty: (data: T) => boolean;
  render: (data: T) => ReactNode;
};

type ResourceState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error' };

export function CapabilityCard<T>({ title, description, path, emptyText, isEmpty, render }: Props<T>) {
  const [state, setState] = useState<ResourceState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    void getJson<T>(path)
      .then((data) => {
        if (active) setState({ status: 'success', data });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, [path]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}. Please try again.</p>}
        {state.status === 'success' && (isEmpty(state.data)
          ? <p>{emptyText}</p>
          : render(state.data))}
      </div>
    </section>
  );
}
