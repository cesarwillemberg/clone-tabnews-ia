# Instruções do projeto

## Estrutura e comandos

- O projeto usa Next.js App Router, React e JavaScript com JSX.
- Rotas e layouts ficam em `app/`; o layout raiz é `app/layout.jsx` e os estilos globais ficam em `app/global.css`.
- Consulte `package.json` para dependências e scripts; use o lockfile existente ao instalar ou atualizar dependências.
- Use `npm run dev` para desenvolvimento, `npm run build` para validar a compilação e `npm start` para executar o build de produção.

## Convenções

- Prefira componentes de servidor. Use Client Components somente quando forem necessários estado, eventos ou APIs do navegador.
- Prefira estado, props e handlers do React a manipulações imperativas do DOM.
- Limpe event listeners, timers e animações criados por efeitos React no retorno do `useEffect`.
- Mantenha estilos globais em `app/global.css` e preserve responsividade, acessibilidade por teclado e a preferência `prefers-reduced-motion`.
- Faça alterações focadas, siga os padrões existentes e evite dependências novas quando os recursos de React, Next.js e CSS forem suficientes.
- Execute os testes, linters e builds disponíveis que cubram a alteração; atualize a documentação diretamente relacionada quando necessário.
