import { Suspense } from 'react';
import ConfettiLoader from './confetti-loader';
import ContentCount from './content-count';
import ContentCountErrorBoundary from './content-count-error-boundary';

// O fetch ocorre em content-count.jsx; revalidamos lá também.
export const revalidate = 60;

export default function Home() {
  return (
    <main className="construction-page">
      <ConfettiLoader />
      <section className="construction-card" aria-labelledby="page-title">
        <p className="construction-label">
          <span className="construction-indicator" aria-hidden="true" />
          TabNews
        </p>

        <h1 id="page-title">Em Construção</h1>
        <p className="construction-message">
          Estamos neste exato momento reconstruindo o TabNews, um lugar na internet para quem
          trabalha com tecnologia e precisa consumir conteúdos com valor concreto.
        </p>

        {/*
          Regra 1.6 (Strategic Suspense Boundaries):
          O shell da página renderiza imediatamente. O contador faz streaming
          assim que o fetch da API do TabNews termina, sem bloquear o resto.
        */}
        <p className="content-count" aria-live="polite">
          <ContentCountErrorBoundary>
            <Suspense
              fallback={
                <span className="content-count-unavailable">
                  Carregando total de conteúdos…
                </span>
              }
            >
              <ContentCount />
            </Suspense>
          </ContentCountErrorBoundary>
        </p>

        <a
          className="official-link"
          href="https://www.tabnews.com.br/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Acessar o site oficial
          <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  );
}
