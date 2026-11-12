const CONTENTS_API_URL = 'https://www.tabnews.com.br/api/v1/contents?per_page=1&page=1';

async function getPublishedContentCount() {
  const response = await fetch(CONTENTS_API_URL);

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

export default async function ContentCount() {
  const count = await getPublishedContentCount();

  return (
    <>
      <strong>{count.toLocaleString('pt-BR')}</strong>
      <span>conteúdos publicados no TabNews</span>
    </>
  );
}
