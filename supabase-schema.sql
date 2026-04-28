create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  documento text not null unique,
  status text not null default 'Ativa',
  created_at timestamptz not null default now()
);

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  usuario text not null unique,
  senha text not null,
  perfil text not null default 'Administrador',
  status text not null default 'Ativo',
  created_at timestamptz not null default now()
);

create table if not exists usuario_empresas (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade,
  primary key (usuario_id, empresa_id)
);

insert into empresas (nome, documento, status)
values ('Minha Empresa LTDA', '11.444.777/0001-61', 'Ativa')
on conflict (documento) do nothing;

-- Troque a senha depois. Esta versao inicial usa senha simples apenas para teste.
insert into usuarios (usuario, senha, perfil, status)
values ('admin', '1234', 'Administrador', 'Ativo')
on conflict (usuario) do nothing;

insert into usuario_empresas (usuario_id, empresa_id)
select u.id, e.id
from usuarios u
cross join empresas e
where u.usuario = 'admin'
  and e.documento = '11.444.777/0001-61'
on conflict do nothing;

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_documento text not null,
  nome text not null,
  documento text not null,
  telefone text,
  cidade text,
  status text not null default 'Ativo',
  created_at timestamptz not null default now()
);

create table if not exists fornecedores (
  id uuid primary key default gen_random_uuid(),
  empresa_documento text not null,
  nome text not null,
  documento text not null,
  telefone text,
  cidade text,
  status text not null default 'Ativo',
  created_at timestamptz not null default now()
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_documento text not null,
  nome text not null,
  categoria text,
  preco numeric not null default 0,
  estoque numeric not null default 0,
  status text not null default 'Ativo',
  created_at timestamptz not null default now()
);

create table if not exists vendas (
  id uuid primary key default gen_random_uuid(),
  empresa_documento text not null,
  data date not null,
  cliente text not null,
  produto text not null,
  status text not null default 'Pendente',
  total numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists contas_receber (
  id uuid primary key default gen_random_uuid(),
  empresa_documento text not null,
  vencimento date not null,
  descricao text not null,
  cliente text not null,
  status text not null default 'Aberto',
  valor numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists contas_pagar (
  id uuid primary key default gen_random_uuid(),
  empresa_documento text not null,
  vencimento date not null,
  descricao text not null,
  fornecedor text not null,
  status text not null default 'Aberto',
  valor numeric not null default 0,
  created_at timestamptz not null default now()
);
