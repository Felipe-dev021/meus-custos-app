-- Script DDL de criação das tabelas no PostgreSQL
-- Banco: meus_custos_db
-- Projeto: Meus Custos (P2 Mobile - Lucas & Felipe)

CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(64) PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lancamentos (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    descricao VARCHAR(200) NOT NULL,
    valor_centavos INTEGER NOT NULL,
    data VARCHAR(10) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    situacao VARCHAR(20) NOT NULL,
    origem_tipo VARCHAR(20),
    origem_divida_id VARCHAR(64),
    origem_parcela_id VARCHAR(64),
    data_pagamento VARCHAR(10),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dividas (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    descricao VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parcelas (
    id VARCHAR(64) PRIMARY KEY,
    divida_id VARCHAR(64) NOT NULL REFERENCES dividas(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    valor_centavos INTEGER NOT NULL,
    data_vencimento VARCHAR(10) NOT NULL,
    situacao VARCHAR(20) NOT NULL,
    despesa_id VARCHAR(64),
    data_pagamento VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS orcamentos (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria VARCHAR(50) NOT NULL,
    limite_centavos INTEGER NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_categoria UNIQUE (usuario_id, categoria)
);

-- Índices de consulta otimizados
CREATE INDEX IF NOT EXISTS idx_lancamentos_usuario ON lancamentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_dividas_usuario ON dividas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_divida ON parcelas(divida_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_usuario ON orcamentos(usuario_id);
