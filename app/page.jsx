import ConfettiEffect from './confetti-effect';

export const dynamic = 'force-dynamic';

const CONTENTS_API_URL = 'https://www.tabnews.com.br/api/v1/contents?per_page=1&page=1';

async function getPublishedContentCount() {
  const response = await fetch(CONTENTS_API_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`TabNews API respondeu com status ${response.status}.`);
  }

  const totalRows = response.headers.get('x-pagination-total-rows');
  const count = Number(totalRows);

  if (totalRows === null || !Number.isSafeInteger(count) || count < 0) {
    throw new Error('A API do TabNews não retornou um total de conteúdos válido.');
  }

  return count;
}

export default async function Home() {
  let publishedContentCount = null;

  try {
    publishedContentCount = await getPublishedContentCount();
  } catch (error) {
    console.error('Não foi possível carregar o total de conteúdos do TabNews.', error);
  }

  return (
    <main className="construction-page">
      <ConfettiEffect />
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

        <p className="content-count" aria-live="polite">
          {publishedContentCount === null ? (
            <span className="content-count-unavailable">
              Não foi possível carregar o total de conteúdos agora.
            </span>
          ) : (
            <>
              <strong>{publishedContentCount.toLocaleString('pt-BR')}</strong>
              <span>conteúdos publicados no TabNews</span>
            </>
          )}
        </p>

        <a
          className="official-link"
          href="https://www.tabnews.com.br/"
          target="_blank"
          rel="noreferrer"
        >
          Acessar o site oficial
          <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  );
}
