# MiniERP

Aplicacao web local para uma primeira versao de MiniERP.

## Modulos iniciais

- Dashboard com receita, clientes, produtos, saldo e alertas de estoque.
- Clientes com cadastro, busca, edicao e exclusao.
- Fornecedores com cadastro, busca, edicao e exclusao.
- Produtos com preco, estoque e alerta de estoque baixo.
- Vendas com data, cliente, produto, status e total.
- Contas a receber e contas a pagar com vencimento, status, valor e saldo consolidado no dashboard.
- Login local com separacao multitenant por empresa.
- Menu hamburguer para abrir e recolher a navegacao.
- Cadastro de empresas e usuarios autorizados para acesso local.
- Logo da admerp aplicado no login e na navegacao.

## Como abrir

Abra `index.html` no navegador. Os dados ficam salvos no `localStorage` do proprio navegador, separados por empresa informada no login.

Para testar rapidamente, use o botao `Popular dados`.
