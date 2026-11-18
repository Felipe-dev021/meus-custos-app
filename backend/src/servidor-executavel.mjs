import http from 'node:http';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/meus_custos_db',
});

const PORT = process.env.PORT || 3001;

function responderJson(res, status, dados) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(dados));
}

async function lerCorpoJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

const servidor = http.createServer(async (req, res) => {
  // Trata CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const caminho = url.pathname;

  try {
    // 1. POST /api/auth/login
    if (req.method === 'POST' && caminho === '/api/auth/login') {
      const body = await lerCorpoJson(req);
      const email = (body.email || 'demo@exemplo.com').trim().toLowerCase();
      const parteNome = email.split('@')[0] || 'Usuário';
      const nomeFormatado = parteNome.charAt(0).toUpperCase() + parteNome.slice(1);

      // Busca ou cria no PostgreSQL
      const busca = await pool.query('SELECT id, nome, email FROM usuarios WHERE email = $1', [email]);
      let usuario;
      if (busca.rows.length > 0) {
        usuario = busca.rows[0];
      } else {
        const id = 'usr-' + Date.now();
        const novo = await pool.query(
          'INSERT INTO usuarios (id, nome, email) VALUES ($1, $2, $3) RETURNING id, nome, email',
          [id, nomeFormatado, email]
        );
        usuario = novo.rows[0];
      }

      return responderJson(res, 200, {
        usuario,
        mensagem: 'Autenticado com sucesso no PostgreSQL.',
      });
    }

    // 2. POST /api/auth/registro
    if (req.method === 'POST' && caminho === '/api/auth/registro') {
      const body = await lerCorpoJson(req);
      const nome = (body.nome || 'Usuário').trim();
      const email = (body.email || 'demo@exemplo.com').trim().toLowerCase();

      const busca = await pool.query('SELECT id, nome, email FROM usuarios WHERE email = $1', [email]);
      if (busca.rows.length > 0) {
        return responderJson(res, 409, { message: 'Já existe um usuário com este e-mail.' });
      }

      const id = 'usr-' + Date.now();
      const novo = await pool.query(
        'INSERT INTO usuarios (id, nome, email) VALUES ($1, $2, $3) RETURNING id, nome, email',
        [id, nome, email]
      );

      return responderJson(res, 201, {
        usuario: novo.rows[0],
        mensagem: 'Cadastro realizado com sucesso.',
      });
    }

    // 3. POST /api/sincronizacao
    if (req.method === 'POST' && caminho === '/api/sincronizacao') {
      const body = await lerCorpoJson(req);
      const usuarioId = body.usuarioId;

      if (!usuarioId) {
        return responderJson(res, 400, { message: 'usuarioId é obrigatório.' });
      }

      // Garante que o usuário existe
      await pool.query(
        'INSERT INTO usuarios (id, nome, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [usuarioId, 'Usuário', `${usuarioId}@exemplo.com`]
      );

      let lancamentosTotal = 0;
      let dividasTotal = 0;
      let orcamentosTotal = 0;

      // Sincroniza lançamentos
      if (Array.isArray(body.lancamentos)) {
        for (const l of body.lancamentos) {
          await pool.query(
            `INSERT INTO lancamentos (id, usuario_id, descricao, valor_centavos, data, tipo, categoria, situacao, origem_tipo, origem_divida_id, origem_parcela_id, data_pagamento)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (id) DO UPDATE SET
               descricao = EXCLUDED.descricao,
               valor_centavos = EXCLUDED.valor_centavos,
               data = EXCLUDED.data,
               tipo = EXCLUDED.tipo,
               categoria = EXCLUDED.categoria,
               situacao = EXCLUDED.situacao,
               origem_tipo = EXCLUDED.origem_tipo,
               origem_divida_id = EXCLUDED.origem_divida_id,
               origem_parcela_id = EXCLUDED.origem_parcela_id,
               data_pagamento = EXCLUDED.data_pagamento,
               atualizado_em = CURRENT_TIMESTAMP`,
            [
              l.id, usuarioId, l.descricao, l.valorCentavos, l.data, l.tipo, l.categoria, l.situacao,
              l.origemTipo || null, l.origemDividaId || null, l.origemParcelaId || null, l.dataPagamento || null
            ]
          );
          lancamentosTotal++;
        }
      }

      // Sincroniza dívidas
      if (Array.isArray(body.dividas)) {
        for (const d of body.dividas) {
          await pool.query(
            `INSERT INTO dividas (id, usuario_id, descricao, categoria)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE SET
               descricao = EXCLUDED.descricao,
               categoria = EXCLUDED.categoria,
               atualizado_em = CURRENT_TIMESTAMP`,
            [d.id, usuarioId, d.descricao, d.categoria]
          );

          if (Array.isArray(d.parcelas)) {
            for (const p of d.parcelas) {
              await pool.query(
                `INSERT INTO parcelas (id, divida_id, numero, valor_centavos, data_vencimento, situacao, despesa_id, data_pagamento)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (id) DO UPDATE SET
                   numero = EXCLUDED.numero,
                   valor_centavos = EXCLUDED.valor_centavos,
                   data_vencimento = EXCLUDED.data_vencimento,
                   situacao = EXCLUDED.situacao,
                   despesa_id = EXCLUDED.despesa_id,
                   data_pagamento = EXCLUDED.data_pagamento`,
                [p.id, d.id, p.numero, p.valorCentavos, p.dataVencimento, p.situacao, p.despesaId || null, p.dataPagamento || null]
              );
            }
          }
          dividasTotal++;
        }
      }

      // Sincroniza orçamentos
      if (Array.isArray(body.orcamentos)) {
        for (const o of body.orcamentos) {
          const id = `orc-${usuarioId}-${o.categoria}`;
          await pool.query(
            `INSERT INTO orcamentos (id, usuario_id, categoria, limite_centavos)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (usuario_id, categoria) DO UPDATE SET
               limite_centavos = EXCLUDED.limite_centavos,
               atualizado_em = CURRENT_TIMESTAMP`,
            [id, usuarioId, o.categoria, o.limiteCentavos]
          );
          orcamentosTotal++;
        }
      }

      return responderJson(res, 200, {
        sucesso: true,
        sincronizadoEm: new Date().toISOString(),
        totais: {
          lancamentos: lancamentosTotal,
          dividas: dividasTotal,
          orcamentos: orcamentosTotal,
        },
      });
    }

    // 4. GET /api/sincronizacao/:usuarioId
    if (req.method === 'GET' && caminho.startsWith('/api/sincronizacao/')) {
      const usuarioId = caminho.replace('/api/sincronizacao/', '');
      const usuarioRes = await pool.query('SELECT id, nome, email FROM usuarios WHERE id = $1', [usuarioId]);
      if (usuarioRes.rows.length === 0) {
        return responderJson(res, 404, { message: 'Usuário não encontrado.' });
      }

      const lancamentosRes = await pool.query('SELECT * FROM lancamentos WHERE usuario_id = $1 ORDER BY data DESC', [usuarioId]);
      const dividasRes = await pool.query('SELECT * FROM dividas WHERE usuario_id = $1', [usuarioId]);
      const orcamentosRes = await pool.query('SELECT categoria, limite_centavos as "limiteCentavos" FROM orcamentos WHERE usuario_id = $1', [usuarioId]);

      return responderJson(res, 200, {
        usuario: usuarioRes.rows[0],
        lancamentos: lancamentosRes.rows,
        dividas: dividasRes.rows,
        orcamentos: orcamentosRes.rows,
        sincronizadoEm: new Date().toISOString(),
      });
    }

    // Rota 404
    return responderJson(res, 404, { message: 'Rota não encontrada.' });
  } catch (erro) {
    console.error('Erro na requisição:', erro);
    return responderJson(res, 500, { message: 'Erro interno no servidor.', erro: String(erro) });
  }
});

servidor.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Backend Conectado ao PostgreSQL rodando em: http://localhost:${PORT}`);
});
