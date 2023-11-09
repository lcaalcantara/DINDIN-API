create database dindin;

create table if not exists usuarios (
	id serial primary key,
  	nome text not null,
  	email text not null unique,
  	senha text not null
);

create table if not exists categorias (
	id serial primary key,
  	descricao text not null
);

insert into categorias (descricao)
values
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas');

create table if not exists transacoes (
	id serial primary key,
  	descricao text,
  	valor integer,
  	data timestamp default now(),
  	categoria_id integer references categorias(id),
  	usuario_id integer references usuarios(id),
  	tipo text not null
);